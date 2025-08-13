import NextAuth, { DefaultSession } from "next-auth";
// import EmailProvider from "next-auth/providers/email";
import GoogleProvider from "next-auth/providers/google";
import { UpstashRedisAdapter } from "@auth/upstash-redis-adapter";
import { Redis } from "@upstash/redis";

import { Message, Role, Status, User } from "@/schemas";
import { tryCatch } from "@/lib/try-catch";
import { api } from "@/apis/client";

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
        // EmailProvider({
        //     // server: {},
        //     server: "smtp://username:password@smtp.example.com:587", // not used
        //     from: "",
        //     async sendVerificationRequest({ identifier: email, url }) {
        //         const { error } = await tryCatch<Message>(api.post<Message>("/auth/send-magic-link", { email, url }));

        //         if (error) {
        //             throw new Error(error);
        //         }
        //     },
        // }),
        {
            id: "http-email",
            name: "Email",
            type: "email",
            maxAge: 60 * 60 * 24, // Email link will expire in 24 hours
            async sendVerificationRequest({ identifier: email, url }) {
                const { error } = await tryCatch<Message>(api.post<Message>("/auth/send-magic-link", { email, url }));

                if (error) {
                    throw new Error(error);
                }
            },
        },
        GoogleProvider({
            clientId: process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID!,
            clientSecret: process.env.NEXT_PUBLIC_GOOGLE_CLIENT_SECRET!,
            allowDangerousEmailAccountLinking: true,
            authorization: { params: { scope: "openid email profile" } },
        }),
    ],
    session: {
        strategy: "jwt",
        maxAge: 60 * 60 * 24 * 7, // 7 days
    },
    pages: {
        signIn: "/auth/signin",
        error: "/auth/error",
        verifyRequest: "/auth/verify-request",
    },
    callbacks: {
        async signIn({ user, account }) {
            // console.log("🚀 ~ file: route.ts:42 ~ account:", account);
            // console.log("🚀 ~ file: route.ts:42 ~ user:", user);
            // if (["email", "google"].includes(account?.provider!)) {
            //     await tryCatch<Message>(api.post<Message>("/auth/sync-user", { email: user.email!, first_name: user.name!, last_name: user.name! }));
            // }

            return true;
        },
        async jwt({ token, user, account, profile }) {
            console.log("🚀 ~ jwt ~ profile:", profile);
            console.log("🚀 ~ jwt ~ account:", account);
            console.log("🚀 ~ file: route.ts:49 ~ user:", user);
            console.log("🚀 ~ file: route.ts:49 ~ token:", token);

            if (account?.provider === "google" && profile) {
                await tryCatch<Message>(
                    api.post<Message>("/auth/sync-user", {
                        email: user.email!,
                        first_name: profile?.given_name!,
                        last_name: profile?.family_name!,
                        image: profile?.picture,
                    })
                );
            }

            const { data, error } = await tryCatch<User>(api.get<User>(`/users/get-user?email=${token.email}`));

            if (error) {
                throw new Error(error);
            }
            if (user) {
                token.user = data;
            }

            if (account && user) {
                return {
                    ...token,
                    accessToken: account.access_token,
                    refreshToken: account.id_token,
                };
            }

            return token;
        },
        async session({ session, token }) {
            // console.log("🚀 ~ file: route.ts:65 ~ token:", token);
            // console.log("🚀 ~ file: route.ts:65 ~ session:", session);
            if (token?.accessToken) {
                session.accessToken = token.accessToken as string;
                session.refreshToken = token.refreshToken as string;
            }
            if (token?.sub) {
                session.user.id = token.sub;
                session.user.first_name = (token.user as User).first_name;
                session.user.last_name = (token.user as User).last_name;
                session.user.status = (token.user as User).status;
                session.user.role = (token.user as User).role as Role;
                session.user.isAdmin = (token.user as User).role === "ADMIN";
                session.user.isActive = (token.user as User).status === "ACTIVE";
            }

            return session;
        },
    },
    debug: true,
});

// export { handler as GET, handler as POST };

// import { handlers } from "@/auth"
// export const { GET, POST } = handlers
