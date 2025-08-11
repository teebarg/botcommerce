"use client";

import React, { useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { toast } from "sonner";

import PageLoader from "@/components/loader";
import { useInvalidate } from "@/lib/hooks/useApi";
import { authApi } from "@/apis/auth";

interface OAuthCallbackHandlerProps {
    provider: "google" | "github";
}

const OAuthCallbackHandler = ({ provider }: OAuthCallbackHandlerProps) => {
    const router = useRouter();
    const searchParams = useSearchParams();
    const code = searchParams.get("code");
    const error = searchParams.get("error");
    const invalidate = useInvalidate();

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

            const { error: err } = await authApi.oauthCallback(provider, code);

            if (err) {
                toast.error(err);
                router.push("/sign-in");

                return;
            }

            toast.success("Successfully signed in!");

            const callbackUrl = searchParams.get("state") || "/";

            setTimeout(() => {
                invalidate("me");
                router.push(callbackUrl || "/");
            }, 1000);
        };

        handleCallback();
    }, [code, error, provider, router, searchParams]);

    return <PageLoader />;
};

export default OAuthCallbackHandler;
