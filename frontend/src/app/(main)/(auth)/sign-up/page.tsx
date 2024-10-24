import { Metadata } from "next";
import { SignUpForm } from "@modules/auth/components/signup";

export const metadata: Metadata = {
    title: "Sign up",
    description: "Sign up to Botcommerce account.",
};

export default function SignUp() {
    return (
        <div className="flex justify-center mt-6">
            <div className="flex flex-1 flex-col justify-center py-10 px-4 sm:px-12 lg:flex-none bg-content1 rounded-lg shadow-md">
                <div className="mx-auto w-full min-w-96 max-w-md">
                    <div>
                        <h2 className="text-3xl font-semibold">Become a Member</h2>
                        <p className="mt-4 text-md font-semibold tracking-tight">
                            Create your Store Member profile, and get access to an enhanced shopping experience.
                        </p>
                    </div>

                    <div className="mt-8">
                        <SignUpForm />
                    </div>
                </div>
            </div>
        </div>
    );
}
