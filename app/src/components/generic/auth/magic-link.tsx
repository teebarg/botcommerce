"use client";

import React, { useState } from "react";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { useSearch } from "@tanstack/react-router"; 
import { Mail } from "lucide-react";

import { Button } from "@/components/ui/button";
import SocialLoginButtons from "@/components/generic/auth/social-login-buttons";
import { Separator } from "@/components/ui/separator";

type Props = {
    callbackUrl?: string;
};

const MagicLinkForm: React.FC<Props> = ({ callbackUrl }) => {
    const [email, setEmail] = useState<string>("");
    const [loading, setLoading] = useState<boolean>(false);
    // const search = useSearch();
    

    const handleEmailSignIn = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!email) {
            toast.error("Please enter a valid email");

            return;
        }
        setLoading(true);

        // await signIn("http-email", {
        //     email,
        //     callbackUrl: callbackUrl || "/",
        // });
    };

    return (
        <React.Fragment>
            <div className="w-full">
                <Input
                    required
                    className=""
                    data-testid="email-input"
                    label="Email address"
                    name="email"
                    placeholder="Enter your email address"
                    startContent={<Mail className="text-muted-foreground" />}
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                />
                <Button
                    aria-label="send magic link"
                    className="w-full mt-6"
                    data-testid="magic-link-button"
                    isLoading={loading}
                    size="lg"
                    type="button"
                    onClick={handleEmailSignIn}
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
