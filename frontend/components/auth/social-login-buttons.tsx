"use client";

import { useState } from "react";
import { useSearchParams } from "next/navigation";

import { Button } from "@/components/ui/button";
import { api } from "@/apis/base";

export default function SocialLoginButtons() {
    const searchParams = useSearchParams();
    const [isLoading, setIsLoading] = useState<"google" | "github" | null>(null);

    const handleSocialLogin = async (provider: "google" | "github") => {
        setIsLoading(provider);
        const { data, error } = await api.get<{ url: string }>(`/auth/oauth/${provider}`);

        if (!data || error) {
            return;
        }
        const url = new URL(data?.url);

        // Add callbackUrl to the OAuth redirect if provided
        const callbackUrl = searchParams.get("callbackUrl");

        if (callbackUrl) {
            url.searchParams.append("state", callbackUrl);
        }

        window.location.href = url.toString();
    };

    return (
        <div className="space-y-3">
            <Button className="w-full" disabled={isLoading !== null} variant="outline" onClick={() => handleSocialLogin("google")}>
                {isLoading === "google" ? (
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-gray-900" />
                ) : (
                    <>
                        <img alt="Google" className="w-5 h-5 mr-2" src="/google.svg" />
                        Continue with Google
                    </>
                )}
            </Button>
        </div>
    );
}
