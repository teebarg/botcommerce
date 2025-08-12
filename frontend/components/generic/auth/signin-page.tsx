"use client";

import { signIn } from "next-auth/react";
import { useState } from "react";
import { useSearchParams } from "next/navigation";
import { Mail, Recycle, Sparkles } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";

export default function SignInPage() {
    const searchParams = useSearchParams();

    const callbackUrl = searchParams?.get("callbackUrl") ?? "/";
    const [email, setEmail] = useState<string>("");
    const [loading, setLoading] = useState<boolean>(false);

    const handleEmailSignIn = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        await signIn("email", {
            email,
            callbackUrl,
        });
    };

    return (
        <div className="w-full max-w-md">
            <div className="bg-white rounded-2xl shadow-xl p-4 md:p-8  border border-emerald-100">
                <>
                    <div className="text-center mb-8">
                        <div className="inline-flex items-center justify-center w-12 h-12 bg-emerald-100 rounded-full mb-4">
                            <Mail className="text-emerald-600" size={24} />
                        </div>
                        <h2 className="text-2xl font-bold text-gray-800 mb-2">Welcome back</h2>
                        <p className="text-gray-600">Enter your email to receive a magic link</p>
                    </div>

                    <div className="space-y-6">
                        <div>
                            <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                                Email address
                            </label>
                            <input
                                type="email"
                                id="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-colors"
                                placeholder="your@email.com"
                            />
                        </div>

                        <button
                            onClick={handleEmailSignIn}
                            disabled={loading}
                            className="w-full bg-gradient-to-r from-emerald-600 to-teal-600 text-white py-3 px-4 rounded-lg font-medium hover:from-emerald-700 hover:to-teal-700 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 transform hover:scale-[1.02]"
                        >
                            {loading ? (
                                <div className="flex items-center justify-center gap-2">
                                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                                    Sending magic link...
                                </div>
                            ) : (
                                "Send magic link"
                            )}
                        </button>

                        <Separator />

                        <Button type="button" onClick={() => signIn("google", { callbackUrl })} variant="outline" className="w-full" size="lg">
                            <img alt="Google" className="w-5 h-5 mr-2" src="/google.svg" />
                            Sign in with Google
                        </Button>
                    </div>

                    <div className="mt-6 text-center">
                        <p className="text-sm text-gray-500">
                            By signing in, you agree to our{" "}
                            <a href="#" className="text-emerald-600 hover:text-emerald-700 font-medium">
                                Terms of Service
                            </a>{" "}
                            and{" "}
                            <a href="#" className="text-emerald-600 hover:text-emerald-700 font-medium">
                                Privacy Policy
                            </a>
                        </p>
                    </div>
                </>
            </div>

            <div className="mt-8 text-center">
                <p className="text-sm text-gray-500">
                    Need help?{" "}
                    <Link href="/contact" className="text-emerald-600 hover:text-emerald-700 font-medium">
                        Contact support
                    </Link>
                </p>
            </div>
        </div>
    );
}
