import NextAuth, { DefaultSession } from "next-auth";
// import GitHub from "next-auth/providers/github";
// import Google from "next-auth/providers/google";
import { authApi } from "@/apis/auth";
import { api } from "@/apis/client";
import { tryCatch } from "@/lib/try-catch";
import { Message, Role, Status, User } from "@/schemas";
import EmailProvider from "next-auth/providers/email";
import GoogleProvider from "next-auth/providers/google";

import { UpstashRedisAdapter } from "@auth/upstash-redis-adapter";
import { Redis } from "@upstash/redis";

const redis = new Redis({
    url: process.env.UPSTASH_REDIS_URL!,
    token: process.env.UPSTASH_REDIS_TOKEN!,
});

declare module "next-auth" {
    interface Session extends DefaultSession {
        user: {
            id: string;
            // ...other properties
            // role: UserRole;
            first_name: string;
            last_name: string;
            email: string;
            role: Role;
            status: Status;
        } & DefaultSession["user"];
    }

    interface User {
        // ...other properties
        id?: string;
        first_name?: string | null | undefined;
        last_name?: string | null | undefined;
        email?: string | null | undefined;
        role: Role;
        status: Status;
    }
}

export const { auth, handlers, signIn, signOut } = NextAuth({
    adapter: UpstashRedisAdapter(redis),
    providers: [
        EmailProvider({
            server: "smtp://username:password@smtp.example.com:587", // not used
            from: "",
            async sendVerificationRequest({ identifier: email, url, provider }) {
                const { error } = await tryCatch<Message>(api.post<Message>("/auth/send-magic-link", { email, url }));
                if (error) {
                    throw new Error(error);
                }
            },
        }),
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
    theme: {
        brandColor: "#3d5239",
        logo: "/logo.png",
    },
    callbacks: {
        async signIn({ user, account }) {
            console.log("🚀 ~ file: route.ts:42 ~ account:", account);
            console.log("🚀 ~ file: route.ts:42 ~ user:", user);
            if (["email", "google"].includes(account?.provider!)) {
                // TODO: Add user to database
                await tryCatch<Message>(api.post<Message>("/auth/sync-user", { email: user.email!, first_name: user.name!, last_name: user.name! }));
            }
            return true;
        },
        async jwt({ token, user }) {
            console.log("🚀 ~ file: route.ts:49 ~ user:", user);
            console.log("🚀 ~ file: route.ts:49 ~ token:", token);
            const { data, error } = await tryCatch<User>(api.get<User>(`/auth/get-user?email=${token.email}`));
            if (error) {    
                throw new Error(error);
            }
            if (user) {
                token.user = data;
            }

            return token;
        },
        async session({ session, token }) {
            console.log("🚀 ~ file: route.ts:65 ~ token:", token);
            console.log("🚀 ~ file: route.ts:65 ~ session:", session);
            if (token?.sub) {
                session.user.id = token.sub;
                session.user.role = (token.user as User).role;
                session.user.first_name = (token.user as User).first_name;
                session.user.last_name = (token.user as User).last_name;
                session.user.status = (token.user as User).status;
            }
            return session;
        },
    },
    debug: true,
});

// export { handler as GET, handler as POST };

// import { handlers } from "@/auth"
// export const { GET, POST } = handlers
