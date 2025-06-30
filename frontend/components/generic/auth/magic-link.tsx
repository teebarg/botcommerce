"use client";

import React, { useState } from "react";
import { Input } from "@components/ui/input";
import { toast } from "sonner";
import { useSearchParams } from "next/navigation";
import { Mail } from "lucide-react";

import { Button } from "@/components/ui/button";
import { api } from "@/apis";
import SocialLoginButtons from "@/components/generic/auth/social-login-buttons";
import { Separator } from "@/components/ui/separator";

type Props = {
    callbackUrl?: string;
};

const MagicLinkForm: React.FC<Props> = ({ callbackUrl }) => {
    const [email, setEmail] = useState<string>("");
    const [loading, setLoading] = useState<boolean>(false);
    const searchParams = useSearchParams();

    const sendLink = async () => {
        if (!email) {
            toast.error("Please enter a valid email");

            return;
        }
        setLoading(true);
        const { data, error } = await api.auth.requestMagicLink(email, (callbackUrl || searchParams.get("callbackUrl")) ?? "/");

        if (error) {
            toast.error(error);
            setLoading(false);

            return;
        }

        toast.success(data?.message);
        setLoading(false);
    };

    return (
        <React.Fragment>
            <div className="w-full">
                <Input
                    required
                    className="bg-content2"
                    data-testid="email-input"
                    label="Email"
                    name="email"
                    placeholder="Enter your email address"
                    startContent={<Mail className="text-default-500" />}
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                />
                <Button
                    aria-label="send magic link"
                    className="w-full mt-6"
                    data-testid="magic-link-button"
                    isLoading={loading}
                    type="button"
                    variant="primary"
                    onClick={sendLink}
                >
                    Send Magic Link
                </Button>
            </div>
            <Separator className="my-6" />
            <SocialLoginButtons callbackUrl={callbackUrl} />
        </React.Fragment>
    );
};

export { MagicLinkForm };
