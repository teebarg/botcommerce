import { Metadata } from "next";
import LocalizedClientLink from "@modules/common/components/localized-client-link";
import { LoginForm } from "@modules/auth/components/login";

export const metadata: Metadata = {
    title: "Sign in",
    description: "Sign in to Botcommerce account.",
};

export default function Login() {
    return (
        <>
            <div className="flex flex-col items-center justify-center bg-gradient-to-br from-primary/10 to-secondary/20 p-2 md:p-6 min-h-screen">
                <div className="max-w-md w-full bg-background rounded-2xl shadow-2xl p-8 transform transition-all hover:scale-105 duration-300">
                    <h2 className="text-3xl font-semibold text-default-900 mb-2 text-center">Botcommerce</h2>

                    <p className="text-default-500 mb-6 text-center text-sm md:text-base">Fill in your details to log into your account</p>

                    <LoginForm />
                    <p className="mt-6 text-xs text-default-500 text-center font-medium">
                        {`Don't have an account?`}{" "}
                        <LocalizedClientLink className="text-secondary" href="/sign-up">
                            Sign up
                        </LocalizedClientLink>
                    </p>
                </div>
            </div>
        </>
    );
}
