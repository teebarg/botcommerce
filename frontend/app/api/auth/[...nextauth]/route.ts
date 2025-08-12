// import { authApi } from "@/apis/auth";
// import { api } from "@/apis/client";
// import { tryCatch } from "@/lib/try-catch";
// import { Message, User } from "@/schemas";
// import NextAuth from "next-auth";
// import EmailProvider from "next-auth/providers/email";
// import GoogleProvider from "next-auth/providers/google";

// import { UpstashRedisAdapter } from "@auth/upstash-redis-adapter"
// import { Redis } from "@upstash/redis"
 
// const redis = new Redis({
//   url: process.env.UPSTASH_REDIS_URL!,
//   token: process.env.UPSTASH_REDIS_TOKEN!,
// })

// const handler = NextAuth({
//     adapter: UpstashRedisAdapter(redis),
//     providers: [
//         EmailProvider({
//             server: "", // not used
//             from: "",
//             async sendVerificationRequest({ identifier: email, url, provider }) {
//                 const { error } = await tryCatch<Message>(api.post<Message>("/auth/send-magic-link", { email, url }));
//                 if (error) {
//                     throw new Error(error);
//                 }
//             },
//         }),
//         GoogleProvider({
//             clientId: process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID!,
//             clientSecret: process.env.NEXT_PUBLIC_GOOGLE_CLIENT_SECRET!,
//             allowDangerousEmailAccountLinking: true,
//         }),
//     ],
//     session: {
//         strategy: "jwt",
//         maxAge: 60 * 60 * 24 * 7, // 7 days
//     },
//     pages: {
//         signIn: "/auth/signin",
//         error: "/auth/error",
//         verifyRequest: "/auth/verify-request",
//     },
//     theme: {
//         brandColor: "#3d5239",
//         logo: "/logo.png",
//     },
//     callbacks: {
//         async signIn({ user, account }) {
//             console.log("🚀 ~ file: route.ts:42 ~ account:", account)
//             console.log("🚀 ~ file: route.ts:42 ~ user:", user)
//             if (["email", "google"].includes(account?.provider!)) {
//                 // TODO: Add user to database
//                 await tryCatch<Message>(api.post<Message>("/auth/sync-user", { email: user.email!, first_name: user.name!, last_name: user.name! }));
//             }
//             return true;
//         },
//         jwt({ token, user }) {
//             console.log("🚀 ~ file: route.ts:49 ~ user:", user)
//             console.log("🚀 ~ file: route.ts:49 ~ token:", token)
//             if (user) {
//                 token.user = {
//                     id: user.id,
//                     email: user.email,
//                     firstName: user.name,
//                     lastName: user.name,
//                     // role: user.role,
//                     // status: user.status,
//                 };
//             }

//             return token;
//         },
//         async session({ session, token }) {
//             console.log("🚀 ~ file: route.ts:65 ~ token:", token)
//             console.log("🚀 ~ file: route.ts:65 ~ session:", session)
//             if (token?.sub) {
//                 session.user.id = token.sub;
//                 session.user.role = (token.user as User).role;
//                 session.user.firstName = (token.user as User).first_name;
//                 session.user.lastName = (token.user as User).last_name;
//                 session.user.status = (token.user as User).status;
//             }
//             return session;
//         },
//     },
//     debug: true,
// });

// export { handler as GET, handler as POST };

import { handlers } from "@/auth"
export const { GET, POST } = handlers
