"use client";

import useWatch from "@lib/hooks/use-watch";
import { GoogleOAuthProvider } from "@react-oauth/google";
import { GoogleLogin } from "@modules/account/components/google";
import React, { useActionState, useState } from "react";
import { Input } from "@components/ui/input";
import { EyeFilled, EyeSlashFilled } from "nui-react-icons";
import { toast } from "sonner";

import LocalizedClientLink from "@/components/ui/link";
import { Button } from "@/components/ui/button";
import { signIn } from "@/actions/auth";
import { requestMagicLink } from "@/actions/auth";

type Props = {};

const MagicLinkForm: React.FC<Props> = () => {
    const [show, setShow] = useState<boolean>(false);
    const [state, formAction, isLoading] = useActionState(signIn, null);
    const [magicLinkState, magicLinkAction] = useActionState(requestMagicLink, null);
    const [showMagicLink, setShowMagicLink] = useState(false);

    useWatch(state, () => {
        if (state?.error) {
            toast.error(state.message);
        }
    });

    useWatch(magicLinkState, () => {
        if (magicLinkState?.error) {
            toast.error(magicLinkState.message);
        } else if (magicLinkState?.message) {
            toast.success(magicLinkState.message);
        }
    });

    if (showMagicLink) {
        return (
            <React.Fragment>
                <form action={magicLinkAction} className="w-full">
                    <div className="flex flex-col w-full gap-y-4">
                        <Input required data-testid="email-input" label="Email" name="email" placeholder="Enter your email address" type="email" />
                    </div>
                    <Button aria-label="send magic link" className="w-full mt-6" data-testid="magic-link-button" isLoading={isLoading} type="submit">
                        Send Magic Link
                    </Button>
                </form>
                <button className="text-sm text-gray-600 mt-4 hover:underline" onClick={() => setShowMagicLink(false)}>
                    Back to password login
                </button>
            </React.Fragment>
        );
    }

    return (
        <React.Fragment>
            <form action={formAction} className="w-full">
                <div className="flex flex-col w-full gap-y-4">
                    <Input required data-testid="email-input" label="Email" name="email" placeholder="Enter your email address" type="email" />
                    <Input
                        required
                        data-testid="password-input"
                        endContent={
                            <button
                                aria-label={show ? "Hide password" : "Show password"}
                                className="text-default-500"
                                type="button"
                                onClick={() => setShow(!show)}
                            >
                                {show ? <EyeSlashFilled className="h-6 w-6" /> : <EyeFilled className="h-6 w-6" />}
                            </button>
                        }
                        label="Password"
                        name="password"
                        type={show ? "text" : "password"}
                    />
                </div>
                <Button aria-label="sign in" className="w-full mt-6" color="primary" data-testid="sign-in-button" type="submit">
                    Sign in
                </Button>
            </form>
            <Button className="mt-4 w-full" type="button" onClick={() => setShowMagicLink(true)}>
                Sign in with magic link
            </Button>
            <span className="text-center text-default-900 text-sm mt-6">
                Not a member?{" "}
                <LocalizedClientLink className="text-warning-900" href={"/sign-up"}>
                    Join us.
                </LocalizedClientLink>
            </span>
            <hr className="tb-divider my-6" />
            <GoogleOAuthProvider clientId={process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID as string}>
                <GoogleLogin />
            </GoogleOAuthProvider>
        </React.Fragment>
    );
};

export { MagicLinkForm };
