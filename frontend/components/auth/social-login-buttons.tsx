"use client";

import { useState } from "react";
import { useSearchParams } from "next/navigation";

import { Button } from "@/components/ui/button";
import { api } from "@/apis/base";

type Props = {
    callbackUrl?: string;
};

export default function SocialLoginButtons({ callbackUrl }: Props) {
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
        const state = callbackUrl || searchParams.get("callbackUrl");

        if (state) {
            url.searchParams.append("state", state);
        }

        window.location.href = url.toString();
    };

    return (
        <div className="space-y-3">
            <Button
                className="w-full"
                disabled={isLoading !== null}
                isLoading={isLoading === "google"}
                variant="outline"
                onClick={() => handleSocialLogin("google")}
            >
                <img alt="Google" className="w-5 h-5 mr-2" src="/google.svg" />
                Continue with Google
            </Button>
        </div>
    );
}
