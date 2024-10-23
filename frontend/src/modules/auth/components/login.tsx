"use client";

import { Input } from "@nextui-org/input";
import { useSnackbar } from "notistack";
import useWatch from "@lib/hooks/use-watch";
import { FormButton } from "@modules/common/components/form-button";
import { GoogleOAuthProvider } from "@react-oauth/google";
import { GoogleLogin } from "@modules/account/components/google";
import LocalizedClientLink from "@modules/common/components/localized-client-link";
import { signIn } from "../action";
import { useFormState } from "react-dom";
import React from "react";
import { usePathname, useRouter, useSearchParams, redirect } from "next/navigation";

type Props = {};

const LoginForm: React.FC<Props> = () => {
    const { enqueueSnackbar } = useSnackbar();
    const [state, formAction] = useFormState(signIn, null);

    const router = useRouter();
    const pathname = usePathname();
    const searchParams = useSearchParams();
    console.log(router)
    console.log(pathname)
    console.log(searchParams)

    useWatch(state, () => {
        if (state?.error) {
            enqueueSnackbar(state.message, {
                variant: "error",
            });
            return
        }
        redirect("/");
        
    });

    return (
        <React.Fragment>
            <form action={formAction} className="w-full">
                <div className="flex flex-col w-full gap-y-4">
                    <Input isRequired data-testid="email-input" label="Email" name="email" placeholder="Enter a valid email address." type="email" />
                    <Input isRequired data-testid="password-input" label="Password" name="password" type="password" />
                </div>
                <FormButton className="w-full mt-6" data-testid="sign-in-button" size="lg">
                    Sign in
                </FormButton>
            </form>
            <span className="text-center text-default-800 text-sm mt-6">
                Not a member? <LocalizedClientLink href={"/sign-up"} className="text-blue-500">Join us.</LocalizedClientLink>
            </span>
            <hr className="tb-divider my-6" />
            <GoogleOAuthProvider clientId={process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID as string}>
                <GoogleLogin />
            </GoogleOAuthProvider>
        </React.Fragment>
    );
};

export { LoginForm };
