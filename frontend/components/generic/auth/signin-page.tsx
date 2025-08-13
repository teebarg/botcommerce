"use client";

import { Mail } from "lucide-react";
import Link from "next/link";

import { Separator } from "@/components/ui/separator";
import { MagicLinkForm } from "./magic-link";

export default function SignInPage() {
    return (
        <div>
            <div className="p-2 md:p-4">
                <div className="text-center mb-8">
                    <div className="inline-flex items-center justify-center w-12 h-12 bg-accent/10 rounded-full mb-4">
                        <Mail className="text-accent" size={24} />
                    </div>
                    <h2 className="text-2xl font-bold text-default-800 mb-2">Welcome back</h2>
                    <p className="text-default-500">Enter your email to receive a magic link</p>
                </div>

                <MagicLinkForm />

                <div className="mt-6 text-center">
                    <p className="text-sm text-gray-500">
                        By signing in, you agree to our{" "}
                        <a className="text-emerald-600 hover:text-emerald-700 font-medium" href="#">
                            Terms of Service
                        </a>{" "}
                        and{" "}
                        <a className="text-emerald-600 hover:text-emerald-700 font-medium" href="#">
                            Privacy Policy
                        </a>
                    </p>
                </div>
            </div>

            <Separator />

            <div className="mt-8 text-center">
                <p className="text-sm text-gray-500">
                    Need help?{" "}
                    <Link className="text-emerald-600 hover:text-emerald-700 font-medium" href="/contact">
                        Contact support
                    </Link>
                </p>
            </div>
        </div>
    );
}
