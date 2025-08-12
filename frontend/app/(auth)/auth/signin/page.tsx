import { type Metadata } from "next";
import SignInPage from "@/components/generic/auth/signin-page";
import { redirect } from "next/navigation";
import { auth } from "@/auth";

export const metadata: Metadata = {
    title: "Sign In",
};

type SearchParams = Promise<{ callbackUrl?: string }>;

export default async function SignIn({ searchParams }: { searchParams: SearchParams }) {
    const session = await auth()
    // const token = session?.token; // if JWT strategy
    console.log("🚀 ~ file: page.tsx:14 ~ session:", session)
    // console.log("🚀 ~ file: page.tsx:14 ~ token:", token)
    const { callbackUrl } = await searchParams;

    if (session?.user) {
        redirect(callbackUrl ?? "/");
    }

    if (session?.user) {
        return null;
    }

    return <SignInPage />;
}
