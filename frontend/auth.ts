import NextAuth, { DefaultSession } from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import { UpstashRedisAdapter } from "@auth/upstash-redis-adapter";
import { Redis } from "@upstash/redis";
import { SignJWT } from "jose";

import { Message, Role, Status, User } from "@/schemas";
import { tryCatch } from "@/lib/try-catch";
import { serverApi } from "@/apis/server-client";

const redis = new Redis({
    url: process.env.UPSTASH_REDIS_URL!,
    token: process.env.UPSTASH_REDIS_TOKEN!,
});

declare module "next-auth" {
    interface Session extends DefaultSession {
        accessToken: string;
        refreshToken: string;
        user: {
            id: string;
            first_name: string;
            last_name: string | undefined;
            email: string;
            role: Role;
            status: Status;
            isAdmin: boolean;
            isActive: boolean;
        } & DefaultSession["user"];
    }
}

export const { auth, handlers, signIn, signOut } = NextAuth({
    adapter: UpstashRedisAdapter(redis),
    providers: [
        {
            id: "http-email",
            name: "Email",
            type: "email",
            maxAge: 60 * 60,
            async sendVerificationRequest({ identifier: email, url }) {
                const { error } = await tryCatch<Message>(serverApi.post<Message>("/auth/send-magic-link", { email, url }));

                if (error) {
                    throw new Error(error);
                }
            },
        },
        GoogleProvider({
            clientId: process.env.GOOGLE_CLIENT_ID!,
            clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
            allowDangerousEmailAccountLinking: true,
            authorization: { params: { scope: "openid email profile" } },
        }),
    ],
    session: {
        strategy: "jwt",
        maxAge: 60 * 60 * 24 * 7,
    },
    pages: {
        signIn: "/auth/signin",
        error: "/auth/error",
        verifyRequest: "/auth/verify-request",
    },
    callbacks: {
        async signIn({ user, account }) {
            // if (["email", "google"].includes(account?.provider!)) {
            //     await tryCatch<Message>(api.post<Message>("/auth/sync-user", { email: user.email!, first_name: user.name!, last_name: user.name! }));
            // }

            return true;
        },
        async jwt({ token, user, account, profile }) {
            if (!account) {
                return token;
            }

            if (account?.provider === "google" && profile) {
                await tryCatch<Message>(
                    serverApi.post<Message>("/auth/sync-user", {
                        email: user.email!,
                        first_name: profile?.given_name!,
                        last_name: profile?.family_name!,
                        image: profile?.picture,
                    })
                );
            }

            const { data, error } = await tryCatch<User>(serverApi.get<User>(`/users/get-user?email=${token.email}`));

            if (error) {
                console.error("JWT user fetch error:", error);

                return token;
            }
            if (data) {
                token.user = data;
                token.accessToken = await generateJoseToken(data?.email!);
            }

            return token;
        },
        async session({ session, token }) {
            if (token?.accessToken) {
                session.accessToken = token.accessToken as string;
            }
            if (token?.sub && token.user) {
                const user = token.user as User;

                session.user.id = token.sub;
                session.user.first_name = user.first_name;
                session.user.last_name = user.last_name;
                session.user.image = user.image;
                session.user.status = user.status;
                session.user.role = user.role as Role;
                session.user.isAdmin = user.role === "ADMIN";
                session.user.isActive = user.status === "ACTIVE";
            }

            return session;
        },
    },
});

async function generateJoseToken(email: string) {
    try {
        const jwt = await new SignJWT({
            email,
            sub: email,
        })
            .setProtectedHeader({ alg: "HS256" })
            .setIssuedAt()
            .setExpirationTime("24h")
            .sign(new TextEncoder().encode(process.env.NEXTAUTH_SECRET!));

        return jwt;
    } catch (error) {
        console.error("Error generating JWT:", error);
        throw error;
    }
}
