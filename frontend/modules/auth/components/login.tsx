"use client";

import { useSnackbar } from "notistack";
import useWatch from "@lib/hooks/use-watch";
import { FormButton } from "@modules/common/components/form-button";
import { GoogleOAuthProvider } from "@react-oauth/google";
import { GoogleLogin } from "@modules/account/components/google";
import LocalizedClientLink from "@modules/common/components/localized-client-link";
import { useFormState } from "react-dom";
import React, { useState } from "react";
import { redirect } from "next/navigation";
import { Input } from "@components/ui/input";
import { EyeFilled, EyeSlashFilled } from "nui-react-icons";

import { signIn } from "../action";

type Props = {};

const LoginForm: React.FC<Props> = () => {
    const [show, setShow] = useState<boolean>(false);
    const { enqueueSnackbar } = useSnackbar();
    const [state, formAction] = useFormState(signIn, null);

    useWatch(state, () => {
        if (state?.error) {
            enqueueSnackbar(state.message, {
                variant: "error",
            });

            return;
        }
        redirect("/");
    });

    return (
        <React.Fragment>
            <form action={formAction} className="w-full">
                <div className="flex flex-col w-full gap-y-4">
                    <Input isRequired data-testid="email-input" label="Email" name="email" placeholder="Enter a valid email address." type="email" />
                    <Input
                        isRequired
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
                <FormButton className="w-full mt-6" data-testid="sign-in-button" size="md">
                    Sign in
                </FormButton>
            </form>
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

export { LoginForm };
