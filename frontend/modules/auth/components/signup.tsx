"use client";

import React, { useActionState, useEffect, useState } from "react";
import { Input } from "@components/ui/input";
import { toast } from "sonner";

import { siteConfig } from "@/lib/config";
import LocalizedClientLink from "@/components/ui/link";
import { Button } from "@/components/ui/button";
import { signUp } from "@/actions/auth";
import { EyeFilled, EyeSlashFilled } from "nui-react-icons";
import SocialLoginButtons from "@/components/auth/social-login-buttons";

type Props = {};

const SignUpForm: React.FC<Props> = () => {
    const [state, formAction, isPending] = useActionState(signUp, null);
    const [show, setShow] = useState<boolean>(false);

    useEffect(() => {
        if (!state) return;
        if (state?.error) {
            toast.error(state.message);
            return;
        }
        toast.success("Please check your email to verify your account");
        window.location.href = "/";
    }, [state]);

    return (
        <React.Fragment>
            <form action={formAction} className="w-full flex flex-col">
                <div className="grid grid-cols-1 md:grid-cols-2 w-full gap-1">
                    <Input required autoComplete="given-name" data-testid="first-name-input" label="First name" name="first_name" />
                    <Input required autoComplete="family-name" data-testid="last-name-input" label="Last name" name="last_name" />
                    <Input
                        wrapperClass="col-span-2"
                        required
                        autoComplete="email"
                        data-testid="email-input"
                        label="Email"
                        name="email"
                        type="email"
                    />
                    <Input autoComplete="tel" data-testid="phone-input" label="Phone" name="phone" type="tel" />
                    <Input
                        required
                        autoComplete="new-password"
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
            <SocialLoginButtons />
        </React.Fragment>
    );
};

export { SignUpForm };
