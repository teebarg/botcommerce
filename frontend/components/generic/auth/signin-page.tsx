"use client";

import { Mail } from "lucide-react";
import Link from "next/link";

import { MagicLinkForm } from "./magic-link";

import { Separator } from "@/components/ui/separator";
import ClientOnly from "@/components/generic/client-only";

export default function SignInPage() {
    return (
        <ClientOnly>
            <div className="p-2 md:p-4">
                <div className="text-center mb-8">
                    <div className="inline-flex items-center justify-center w-12 h-12 bg-contrast/10 rounded-full mb-4">
                        <Mail className="text-contrast" size={24} />
                    </div>
                    <h2 className="text-2xl font-bold mb-2">Welcome back</h2>
                    <p className="text-muted-foreground">Enter your email to receive a magic link</p>
                </div>

                <MagicLinkForm />

                <div className="mt-6 text-center">
                    <p className="text-sm text-gray-500">
                        By signing in, you agree to our{" "}
                        <a className="text-contrast font-medium" href="#">
                            Terms of Service
                        </a>{" "}
                        and{" "}
                        <a className="text-contrast font-medium" href="#">
                            Privacy Policy
                        </a>
                    </p>
                </div>
            </div>

            <Separator />

            <div className="mt-8 text-center">
                <p className="text-sm text-gray-500">
                    Need help?{" "}
                    <Link prefetch className="text-contrast font-medium" href="/contact">
                        Contact support
                    </Link>
                </p>
            </div>
        </ClientOnly>
    );
}
