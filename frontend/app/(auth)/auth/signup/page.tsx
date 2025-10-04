import { Metadata } from "next";

import { SignUpForm } from "@/components/generic/auth/signup";
import { getSiteConfig } from "@/lib/config";
import LocalizedClientLink from "@/components/ui/link";

export const metadata: Metadata = {
    title: "Sign Up",
};

export default async function SignUp() {
    const siteConfig = await getSiteConfig();

    return (
        <>
            <h2 className="text-3xl font-semibold mb-1 text-center">{siteConfig.name}</h2>

            <p className="text-muted-foreground mb-6 text-center text-sm">
                Create your Store Member profile, and get access to an enhanced shopping experience.
            </p>

            <SignUpForm />
            <p className="mt-6 text-xs text-muted-foreground text-center font-medium">
                Already have an account?{" "}
                <LocalizedClientLink className="text-secondary" href="/auth/signin">
                    Sign in
                </LocalizedClientLink>
            </p>
        </>
    );
}
