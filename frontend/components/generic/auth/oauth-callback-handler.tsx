"use client";

import { useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { toast } from "sonner";
import React from "react";

import { api } from "@/apis/base";
import { Token } from "@/schemas";
import { setCookie } from "@/lib/util/cookie";
import PageLoader from "@/components/loader";

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

    return <PageLoader type="authentication" />;
};

export default OAuthCallbackHandler;
