"use client";

import { useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { toast } from "sonner";
import React from "react";
import { ShoppingBag } from "nui-react-icons";
import { CircleDot } from "lucide-react";

import { api } from "@/apis/base";
import { Token } from "@/types/models";
import { setCookie } from "@/lib/util/cookie";

interface OAuthCallbackHandlerProps {
    provider: "google" | "github";
}

const OAuthCallbackHandler = ({ provider }: OAuthCallbackHandlerProps) => {
    const router = useRouter();
    const searchParams = useSearchParams();
    const code = searchParams.get("code");
    const error = searchParams.get("error");

    useEffect(() => {
        const handleCallback = async () => {
            if (error) {
                toast.error("Authentication failed");
                router.push("/sign-in");

                return;
            }

            if (!code) {
                toast.error("No authorization code received");
                router.push("/sign-in");

                return;
            }

            const { data, error: err } = await api.post<Token>(`/auth/oauth/${provider}/callback`, {
                code,
            });

            if (err) {
                toast.error(error);
                router.push("/sign-in");

                return;
            }

            if (data?.access_token) {
                setCookie("access_token", data.access_token);
                // Redirect to the intended destination or dashboard
                const callbackUrl = searchParams.get("state") || "/";

                router.push(callbackUrl);
                toast.success("Successfully signed in!");
            }
        };

        handleCallback();
    }, [code, error, provider, router, searchParams]);

    return (
        <React.Fragment>
            <div className="min-h-screen bg-gradient-to-b from-white to-gray-50 flex items-center justify-center p-4">
                {/* Mobile-first container */}
                <div className="w-full max-w-md mx-auto">
                    {/* Logo and branding */}
                    <div className="flex flex-col items-center mb-12 animate-fade-in">
                        <div className="relative">
                            <ShoppingBag className="w-16 h-16 text-indigo-600 animate-float" />
                            <div className="absolute -right-1 -top-1">
                                <CircleDot className="w-6 h-6 text-indigo-400 animate-pulse" />
                            </div>
                        </div>
                        <h1 className="mt-4 text-2xl font-bold text-gray-900">ShopEase</h1>
                        <p className="mt-2 text-gray-600 text-center">Authenticating your session</p>
                    </div>

                    {/* Loading animation */}
                    <div className="space-y-4">
                        <div className="flex justify-center space-x-2">
                            {[...Array(3)].map((_, i) => (
                                <div
                                    key={i}
                                    className="w-3 h-3 bg-indigo-600 rounded-full animate-bounce"
                                    style={{ animationDelay: `${i * 0.1}s` }}
                                />
                            ))}
                        </div>

                        {/* Loading bar */}
                        <div className="bg-gray-200 rounded-full overflow-hidden">
                            <div className="h-2 bg-indigo-600 rounded-full animate-loading-bar" />
                        </div>

                        {/* Status message */}
                        <p className="text-sm text-gray-500 text-center animate-pulse">Please wait while we securely log you in...</p>
                    </div>

                    {/* Bottom section */}
                    <div className="mt-12 text-center">
                        <p className="text-xs text-gray-400">Powered by secure OAuth authentication</p>
                    </div>
                </div>
            </div>
            <div className="min-h-screen flex items-center justify-center">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900 mx-auto mb-4" />
                    <p className="text-gray-600">Completing your sign in...</p>
                </div>
            </div>
        </React.Fragment>
    );
};

export default OAuthCallbackHandler;
