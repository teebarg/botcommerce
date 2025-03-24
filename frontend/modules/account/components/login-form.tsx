import { useSnackbar } from "notistack";
import useWatch from "@lib/hooks/use-watch";
import { GoogleOAuthProvider } from "@react-oauth/google";
import { Input } from "@components/ui/input";
import { useActionState } from "react";

import { GoogleLogin } from "./google";

import LocalizedClientLink from "@/components/ui/link";
import { Button } from "@/components/ui/button";
import { signIn } from "@/actions/auth";

type Props = {};

const CheckoutLoginForm: React.FC<Props> = () => {
    const { enqueueSnackbar } = useSnackbar();
    const [state, formAction, isPending] = useActionState(signIn, null);

    useWatch(state, () => {
        if (state?.error) {
            enqueueSnackbar(state.message, {
                variant: "error",
            });
        }
    });

    return (
        <div className="p-6">
            <h1 className="text-center text-2xl uppercase font-medium mb-1">Sign In</h1>
            <p className="text-center text-base mb-8">Sign in to place your order.</p>
            <form action={formAction} className="w-full">
                <div className="flex flex-col w-full gap-y-4">
                    <Input required data-testid="email-input" label="Email" name="email" placeholder="Enter a valid email address." type="email" />
                    <Input required data-testid="password-input" label="Password" name="password" type="password" />
                </div>
                <Button aria-label="sign in" className="w-full mt-6" color="primary" data-testid="sign-in-button" isLoading={isPending} type="submit">
                    Sign in
                </Button>
            </form>
            <span className="text-default-900 text-sm mt-2 block">
                Not a member?{" "}
                <LocalizedClientLink className="text-blue-500 underline" data-testid="register-button" href={"/sign-in"}>
                    Join us
                </LocalizedClientLink>
            </span>
            <hr className="tb-divider my-6" />
            <GoogleOAuthProvider clientId={process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID as string}>
                <GoogleLogin />
            </GoogleOAuthProvider>
        </div>
    );
};

export default CheckoutLoginForm;
