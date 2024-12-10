import { Metadata } from "next";
import { SignUpForm } from "@modules/auth/components/signup";

import LocalizedClientLink from "@/modules/common/components/localized-client-link";

export const metadata: Metadata = {
    title: "Sign up",
    description: "Sign up to Botcommerce account.",
};

export default function SignUp() {
    return (
        <>
            <div className="flex flex-col items-center justify-center bg-gradient-to-br from-primary/10 to-secondary/20 p-2 md:p-6 min-h-screen">
                <div className="max-w-md w-full bg-background rounded-2xl shadow-2xl p-8 transform transition-all hover:scale-105 duration-300">
                    <h2 className="text-3xl font-semibold text-default-900 mb-2 text-center">Botcommerce</h2>

                    <p className="text-default-500 mb-6 text-center text-sm md:text-base">
                        Create your Store Member profile, and get access to an enhanced shopping experience.
                    </p>

                    <SignUpForm />
                    <p className="mt-6 text-xs text-default-500 text-center font-medium">
                        Already have an account?{" "}
                        <LocalizedClientLink className="text-secondary" href="/sign-in">
                            Sign in
                        </LocalizedClientLink>
                    </p>
                </div>
            </div>
        </>
    );
}
