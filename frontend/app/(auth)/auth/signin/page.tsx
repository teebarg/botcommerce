import { type Metadata } from "next";
import { redirect } from "next/navigation";

import SignInPage from "@/components/generic/auth/signin-page";
import { auth } from "@/auth";

export const metadata: Metadata = {
    title: "Sign In",
};

type SearchParams = Promise<{ callbackUrl?: string }>;

export default async function SignIn({ searchParams }: { searchParams: SearchParams }) {
    const session = await auth();

    const sP = await searchParams;

    if (session?.user && sP.callbackUrl) {
        redirect(sP.callbackUrl ?? "/");
    }

    return <SignInPage />;
}
