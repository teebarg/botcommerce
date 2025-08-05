"use client";

import { useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { toast } from "sonner";
import React from "react";

import { api } from "@/apis/client";
import { Token } from "@/schemas";
import { setCookie } from "@/lib/util/cookie";
import PageLoader from "@/components/loader";
import { tryCatch } from "@/lib/try-catch";
import { useInvalidate } from "@/lib/hooks/useApi";

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

            const { data, error: err } = await tryCatch<Token>(
                api.post(`/auth/oauth/${provider}/callback`, {
                    code,
                })
            );

            if (err) {
                toast.error(error);
                router.push("/sign-in");

                return;
            }

            if (data?.access_token) {
                invalidate("me");
                setCookie("access_token", data.access_token);
                const callbackUrl = searchParams.get("state") || "/";

                toast.success("Successfully signed in!");
                setTimeout(() => {
                    router.push(callbackUrl || "/");
                }, 1000);
            }
        };

        handleCallback();
    }, [code, error, provider, router, searchParams]);

    return <PageLoader />;
};

export default OAuthCallbackHandler;
