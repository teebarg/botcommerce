import { Metadata } from "next";
import { SignUpForm } from "@modules/auth/components/signup";

import { siteConfig } from "@/lib/config";
import LocalizedClientLink from "@/components/ui/link";

export const metadata: Metadata = {
    title: `Sign Up | ${siteConfig.name}`,
    description: `Sign up to ${siteConfig.name} account.`,
};

export default function SignUp() {
    return (
        <>
            <h2 className="text-3xl font-semibold text-default-900 mb-2 text-center">{siteConfig.name}</h2>

            <p className="text-default-500 mb-6 text-center text-sm md:text-base">
                Create your Store Member profile, and get access to an enhanced shopping experience.
            </p>

            <SignUpForm />
            <p className="mt-6 text-xs text-default-500 text-center font-medium">
                Already have an account?{" "}
                <LocalizedClientLink href="/sign-in">
                    Sign in
                </LocalizedClientLink>
            </p>
        </>
    );
}
