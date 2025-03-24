"use client";

import useWatch from "@lib/hooks/use-watch";
import { GoogleOAuthProvider } from "@react-oauth/google";
import { GoogleLogin } from "@modules/account/components/google";
import React, { useActionState } from "react";
import { Input } from "@components/ui/input";
import { toast } from "sonner";

import { siteConfig } from "@/lib/config";
import LocalizedClientLink from "@/components/ui/link";
import { Button } from "@/components/ui/button";
import { signUp } from "@/actions/auth";

type Props = {};

const SignUpForm: React.FC<Props> = () => {
    const [state, formAction, isPending] = useActionState(signUp, null);

    useWatch(state, () => {
        if (state?.error) {
            toast.error(state.message);
        }
    });

    return (
        <React.Fragment data-testid="login-page">
            <form action={formAction} className="w-full flex flex-col">
                <div className="flex flex-col w-full gap-y-2">
                    <div className="flex flex-col md:flex-row gap-2">
                        <Input required autoComplete="given-name" data-testid="first-name-input" label="First name" name="first_name" />
                        <Input required autoComplete="family-name" data-testid="last-name-input" label="Last name" name="last_name" />
                    </div>
                    <Input required autoComplete="email" data-testid="email-input" label="Email" name="email" type="email" />
                    <div className="flex flex-col md:flex-row gap-2">
                        <Input autoComplete="tel" data-testid="phone-input" label="Phone" name="phone" type="tel" />
                        <Input required autoComplete="new-password" data-testid="password-input" label="Password" name="password" type="password" />
                    </div>
                </div>
                <span className="text-center text-default-500 text-xs mt-6">
                    By creating an account, you agree to {siteConfig.name} Store&apos;s{" "}
                    <LocalizedClientLink className="underline" href="/content/privacy-policy">
                        Privacy Policy
                    </LocalizedClientLink>{" "}
                    and{" "}
                    <LocalizedClientLink className="underline" href="/content/terms-of-use">
                        Terms of Use
                    </LocalizedClientLink>
                    .
                </span>
                <Button
                    aria-label="join us"
                    className="w-full mt-6"
                    color="warning"
                    data-testid="register-button"
                    isLoading={isPending}
                    size="lg"
                    type="submit"
                >
                    Join Us
                </Button>
            </form>
            <hr className="tb-divider my-6" />
            <GoogleOAuthProvider clientId={process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID as string}>
                <GoogleLogin />
            </GoogleOAuthProvider>
        </React.Fragment>
    );
};

export { SignUpForm };
