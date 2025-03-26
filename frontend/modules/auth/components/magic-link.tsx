"use client";

import { GoogleOAuthProvider } from "@react-oauth/google";
import { GoogleLogin } from "@modules/account/components/google";
import React, { useState } from "react";
import { Input } from "@components/ui/input";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { api } from "@/apis";

type Props = {
    callbackUrl?: string;
};

const MagicLinkForm: React.FC<Props> = ({ callbackUrl }) => {
    const [email, setEmail] = useState<string>();
    const [loading, setLoading] = useState<boolean>(false);

    const sendLink = async () => {
        if (!email) {
            toast.error("Please enter a valid email");

            return;
        }
        setLoading(true);
        const { data, error } = await api.auth.requestMagicLink(email, callbackUrl);

        setLoading(false);

        if (error) {
            toast.error(error);

            return;
        }

        toast.success(data?.message);
    };

    return (
        <React.Fragment>
            <div className="w-full">
                <div className="flex flex-col w-full gap-y-4">
                    <Input
                        required
                        data-testid="email-input"
                        label="Email"
                        name="email"
                        placeholder="Enter your email address"
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                    />
                </div>
                <Button
                    aria-label="send magic link"
                    className="w-full mt-6"
                    data-testid="magic-link-button"
                    isLoading={loading}
                    type="button"
                    onClick={sendLink}
                >
                    Send Magic Link
                </Button>
            </div>
            <hr className="tb-divider my-6" />
            <GoogleOAuthProvider clientId={process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID as string}>
                <GoogleLogin />
            </GoogleOAuthProvider>
        </React.Fragment>
    );
};

export { MagicLinkForm };
