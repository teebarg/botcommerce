"use client";

import { useSnackbar } from "notistack";
import useWatch from "@lib/hooks/use-watch";
import { GoogleOAuthProvider } from "@react-oauth/google";
import { GoogleLogin } from "@modules/account/components/google";
import React, { useActionState, useState } from "react";
import { redirect } from "next/navigation";
import { Input } from "@components/ui/input";
import { EyeFilled, EyeSlashFilled } from "nui-react-icons";

import LocalizedClientLink from "@/components/ui/link";
import { Button } from "@/components/ui/button";
import { signIn } from "@/actions/auth";
import { toast } from "sonner";

type Props = {};

const LoginForm: React.FC<Props> = () => {
    const [show, setShow] = useState<boolean>(false);
    // const { enqueueSnackbar } = useSnackbar();
    const [state, formAction, isPending] = useActionState(signIn, null);

    useWatch(state, () => {
        if (state?.error) {
            toast.error(state.message);
            return;
        }
        redirect("/");
    });

    return (
        <React.Fragment>
            <form action={formAction} className="w-full">
                <div className="flex flex-col w-full gap-y-4">
                    <Input required data-testid="email-input" label="Email" name="email" placeholder="Enter a valid email address." type="email" />
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
                <Button aria-label="sign in" className="w-full mt-6" data-testid="sign-in-button" isLoading={isPending} size="lg" type="submit">
                    Sign in
                </Button>
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
