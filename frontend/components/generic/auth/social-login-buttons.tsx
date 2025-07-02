"use client";

import { useState } from "react";
import { useSearchParams } from "next/navigation";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { api } from "@/apis/client";
import { tryCatch } from "@/lib/try-catch";

type Props = {
    callbackUrl?: string;
};

export default function SocialLoginButtons({ callbackUrl }: Props) {
    const searchParams = useSearchParams();
    const [isLoading, setIsLoading] = useState<"google" | "github" | null>(null);

    const handleSocialLogin = async (provider: "google" | "github") => {
        setIsLoading(provider);
        const { data, error } = await tryCatch<{ url: string }>(api.get(`/auth/oauth/${provider}`));

        if (error || !data?.url) {
            toast.error(error);
            setIsLoading(null);

            return;
        }
        const url = new URL(data?.url);

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
