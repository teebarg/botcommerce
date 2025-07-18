import { Metadata } from "next";

import { getSiteConfig } from "@/lib/config";
import LocalizedClientLink from "@/components/ui/link";
import { MagicLinkForm } from "@/components/generic/auth/magic-link";
import ClientOnly from "@/components/generic/client-only";

export const metadata: Metadata = {
    title: "Login In",
};

export default async function Login() {
    const siteConfig = await getSiteConfig();

    return (
        <ClientOnly>
            <h2 className="text-3xl font-semibold text-default-900 mb-1 text-center">{siteConfig.name}</h2>

            <p className="text-default-500 mb-6 text-center text-sm">Fill in your details to log into your account</p>
            <MagicLinkForm />
            <p className="mt-6 text-xs text-default-500 text-center font-medium">
                {`Don't have an account?`}{" "}
                <LocalizedClientLink className="text-secondary" href="/sign-up">
                    Sign up
                </LocalizedClientLink>
            </p>
        </ClientOnly>
    );
}
