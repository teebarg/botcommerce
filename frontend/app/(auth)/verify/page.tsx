"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import { toast } from "sonner";

import LocalizedClientLink from "@/components/ui/link";
import { BtnLink } from "@/components/ui/btnLink";
import { Button } from "@/components/ui/button";
import { api } from "@/apis";
import { useStore } from "@/app/store/use-store";
import { useInvalidate } from "@/lib/hooks/useApi";

export default function VerifyMagicLink() {
    const [authState, setAuthState] = useState<"loading" | "success" | "expired">("loading");
    const router = useRouter();
    const searchParams = useSearchParams();
    const token = searchParams.get("token");
    const callbackUrl = searchParams.get("callbackUrl");
    const invalidate = useInvalidate();

    const { shopSettings } = useStore();

    useEffect(() => {
        async function verifyToken() {
            if (!token) {
                toast.error("Invalid magic link");
                setAuthState("expired");
                // router.push("/sign-in");

                return;
            }

            const { error } = await api.auth.verifyMagicLink(token);

            if (error) {
                toast.error(error);
                setAuthState("expired");
                // router.push("/sign-in");

                return;
            }

            invalidate("me");

            setAuthState("success");
            setTimeout(() => {
                router.push(callbackUrl || "/");
            }, 1000);
        }

        verifyToken();
    }, [token]);

    return (
        <>
            <div className="bg-linear-to-r from-blue-500 to-blue-600 p-6 text-center text-white">
                <div className="text-2xl font-bold mb-2">{shopSettings.shop_name}</div>
                <h2 className="text-lg font-medium mb-1 opacity-90">Magic Link Authentication</h2>
                <p className="text-sm opacity-80">Simple, secure, passwordless login</p>
            </div>
            <div className="p-8 text-center">
                {/* Loading State */}
                {authState === "loading" && (
                    <div>
                        <div className="w-20 h-20 rounded-full bg-blue-100 flex items-center justify-center mx-auto mb-5">
                            <svg
                                fill="none"
                                height="40"
                                stroke="#4a6cf7"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth="2"
                                viewBox="0 0 24 24"
                                width="40"
                            >
                                <circle cx="12" cy="12" r="10" />
                                <path d="M12 6v6l4 2" />
                            </svg>
                        </div>
                        <div className="mb-6">
                            <h3 className="text-xl font-semibold mb-3 text-default-800">Verifying your magic link</h3>
                            <p className="text-default-500 text-base">Please wait while we authenticate your session...</p>
                            <div className="flex justify-center my-4">
                                <div className="mx-1 w-2 h-2 bg-default-200 rounded-full animate-bounce" />
                                <div className="mx-1 w-2 h-2 bg-default-200 rounded-full animate-bounce" style={{ animationDelay: "0.2s" }} />
                                <div className="mx-1 w-2 h-2 bg-default-200 rounded-full animate-bounce" style={{ animationDelay: "0.4s" }} />
                            </div>
                        </div>
                    </div>
                )}

                {/* Success State */}
                {authState === "success" && (
                    <div>
                        <div className="w-20 h-20 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-5">
                            <svg
                                fill="none"
                                height="40"
                                stroke="#10b981"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth="2"
                                viewBox="0 0 24 24"
                                width="40"
                            >
                                <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
                                <polyline points="22 4 12 14.01 9 11.01" />
                            </svg>
                        </div>
                        <div className="mb-6">
                            <h3 className="text-xl font-semibold mb-3 text-default-800">Successfully Authenticated!</h3>
                            <p className="text-default-500 text-base mb-2">{`You're now securely logged in to your account.`}</p>
                            <p className="text-default-500 text-base">{`You'll be redirected to your dashboard in a moment...`}</p>
                        </div>
                        <Button
                            className="bg-blue-500 hover:bg-blue-600 text-white font-medium py-3 px-8 rounded-lg transition-all duration-200 transform hover:-translate-y-1 active:translate-y-0 animate-pulse"
                            onClick={() => router.push(callbackUrl || "/")}
                        >
                            Continue
                        </Button>
                    </div>
                )}

                {/* Expired State */}
                {authState === "expired" && (
                    <div>
                        <div className="w-20 h-20 rounded-full bg-red-100 flex items-center justify-center mx-auto mb-5">
                            <svg
                                fill="none"
                                height="40"
                                stroke="#ef4444"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth="2"
                                viewBox="0 0 24 24"
                                width="40"
                            >
                                <circle cx="12" cy="12" r="10" />
                                <line x1="12" x2="12" y1="8" y2="12" />
                                <line x1="12" x2="12.01" y1="16" y2="16" />
                            </svg>
                        </div>
                        <div className="mb-6">
                            <h3 className="text-xl font-semibold mb-3 text-default-900">Magic Link Expired</h3>
                            <p className="text-default-500 text-base mb-2">This magic link has expired or already been used.</p>
                            <p className="text-default-500 text-base">Please request a new magic link to continue.</p>
                        </div>
                        <BtnLink className="w-full" href="/sign-in" size="lg">
                            Request New Link
                        </BtnLink>
                    </div>
                )}

                <div className="mt-8 text-sm text-default-500">
                    <p>
                        Need help?{" "}
                        <LocalizedClientLink className="text-blue-500 hover:text-blue-600" href="/support">
                            Contact Support
                        </LocalizedClientLink>
                    </p>
                    <p className="mt-1">&copy; 2025 {shopSettings.shop_name}. All rights reserved.</p>
                </div>
            </div>
        </>
    );
}
