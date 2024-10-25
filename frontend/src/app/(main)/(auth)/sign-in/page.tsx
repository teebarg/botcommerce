import { Metadata } from "next";
import LocalizedClientLink from "@modules/common/components/localized-client-link";
import { LoginForm } from "@modules/auth/components/login";

export const metadata: Metadata = {
    title: "Sign in",
    description: "Sign in to Botcommerce account.",
};

export default function Login() {
    return (
        <div className="flex justify-center mt-6">
            <div className="flex flex-1 flex-col justify-center py-10 px-4 sm:px-12 lg:flex-none bg-content1 rounded-lg shadow-md">
                <div className="mx-auto w-full min-w-96">
                    <div>
                        <h2 className="text-3xl font-semibold">Botcommerce</h2>
                        <h2 className="mt-6 text-xl font-semibold tracking-tight">Sign in to your account!</h2>
                        <p className="mt-2 text-sm leading-6 text-gray-500">
                            Not a member?
                            <LocalizedClientLink className="ml-2 font-semibold text-blue-500" href={"/sign-up"}>
                                Start a 14 day free trial
                            </LocalizedClientLink>
                            .
                        </p>
                    </div>

                    <div className="mt-8">
                        <LoginForm />
                    </div>
                </div>
            </div>
        </div>
    );
}
