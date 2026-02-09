import type { StartAuthJSConfig } from "start-authjs";
import Google from "@auth/core/providers/google";
import { UpstashRedisAdapter } from "@auth/upstash-redis-adapter";
import { Redis } from "@upstash/redis";
import { SignJWT } from "jose";

import { tryCatch } from "@/utils/try-catch";
import type { User, Address, Role, Status, Message } from "@/schemas";
import { api } from "./fetch-api";
import { getUserFn } from "@/server/users.server";

const redis = new Redis({
    url: process.env.UPSTASH_REDIS_URL!,
    token: process.env.UPSTASH_REDIS_TOKEN!,
});

async function generateJoseToken(email: string) {
    try {
        const jwt = await new SignJWT({
            email,
            sub: email,
        })
            .setProtectedHeader({ alg: "HS256" })
            .setIssuedAt()
            .setExpirationTime("7d")
            .sign(new TextEncoder().encode(process.env.AUTH_SECRET!));

        return jwt;
    } catch (error) {
        console.error("Error generating JWT:", error);
        throw error;
    }
}

declare module "@auth/core/types" {
    interface Session extends DefaultSession {
        id: number;
        accessToken: string;
        refreshToken: string;
        impersonated?: boolean;
        impersonatedBy?: string | null;
        user: {
            id: number;
            first_name: string;
            last_name: string | undefined;
            email: string;
            role: Role;
            status: Status;
            isAdmin: boolean;
            isActive: boolean;
            addresses: Address[];
        } & DefaultSession["user"];
    }
    // Extend the User interface (for the user object returned by providers)
    interface User {
        id: number;
        first_name: string;
        last_name?: string;
        email: string;
        role: Role;
        status: Status;
        addresses: Address[];
    }

    // Extend the JWT interface (token that's stored)
    interface JWT {
        user?: User;
        accessToken?: string;
        refreshToken?: string;
        impersonated?: boolean;
        impersonatedBy?: string | null;
    }
}

export const authConfig: StartAuthJSConfig = {
    secret: process.env.AUTH_SECRET,
    adapter: UpstashRedisAdapter(redis),
    session: {
        strategy: "jwt",
        maxAge: 60 * 60 * 24 * 30 * 12,
    },
    pages: {
        signIn: "/auth/signin",
        error: "/auth/error",
        verifyRequest: "/auth/verify-request",
    },
    providers: [
        {
            id: "http-email",
            name: "Email",
            type: "email",
            maxAge: 60 * 60 * 24 * 30 * 12,
            async sendVerificationRequest({ identifier: email, url }) {
                const { error } = await tryCatch<Message>(api.post("/auth/send-magic-link", { email, url }));
                if (error) throw new Error(error);
            },
        },
        Google({
            clientId: process.env.GOOGLE_CLIENT_ID!,
            clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
            allowDangerousEmailAccountLinking: true,
            authorization: { params: { scope: "openid email profile" } },
            async profile(profile, tokens) {
                await tryCatch(
                    api.post<Message>("/auth/sync-user", {
                        email: profile.email!,
                        first_name: profile.given_name ?? "",
                        last_name: profile.family_name ?? "",
                        image: profile.picture,
                    })
                );
                return profile;
            },
        }),
    ],
    callbacks: {
        async jwt({ token, user, account, profile, trigger, session }) {
            if (trigger === "update" && session?.mode === "impersonate") {
                const { data } = await tryCatch<User>(getUserFn({ data: session.email! }));

                if (data) {
                    token.user = data;
                    token.impersonated = session.impersonated;
                    token.impersonatedBy = session.impersonatedBy;
                    token.email = session.email;
                    token.accessToken = await generateJoseToken(session.email);
                }
                return token;
            }

            // Refresh
            if (trigger === "update" && session?.mode === "refresh") {
                const { data } = await tryCatch<User>(getUserFn({ data: session.email! }));

                if (data) {
                    token.user = data;
                }
                return token;
            }

            if (account?.provider === "google" || account?.provider === "http-email") {
                const { data } = await tryCatch<User>(getUserFn({ data: token.email! }));
                if (data) {
                    token.user = data;
                    token.accessToken = await generateJoseToken(data.email);
                }
            }

            return token;
        },

        async session({ session, token }) {
            if (token?.user) {
                const user = token.user as User;

                session.id = user.id;
                session.user.first_name = user.first_name;
                session.user.last_name = user.last_name;
                session.user.role = user.role as Role;
                session.user.status = user.status as Status;
                session.user.isAdmin = user.role === "ADMIN";
                session.user.isActive = user.status === "ACTIVE";
                session.user.addresses = user.addresses as Address[];

                session.accessToken = token.accessToken as string;
                session.impersonated = token.impersonated as boolean;
                session.impersonatedBy = token.impersonatedBy as string | null;
            }

            return session;
        },
    },
};
