import { useFormState } from "react-dom";
import { LOGIN_VIEW } from "@modules/account/templates/login-template";
import { logCustomerIn } from "@modules/account/actions";
import { Input } from "@nextui-org/input";
import { useSnackbar } from "notistack";
import useWatch from "@lib/hooks/use-watch";
import { FormButton } from "@modules/common/components/form-button";
import { GoogleOAuthProvider } from "@react-oauth/google";

import { GoogleLogin } from "./google";

type Props = {
    setCurrentView?: (view: LOGIN_VIEW) => void; // eslint-disable-line
};

const CheckoutLoginForm = ({ setCurrentView }: Props) => {
    const { enqueueSnackbar } = useSnackbar();
    const [state, formAction] = useFormState(logCustomerIn, null);

    useWatch(state, () => {
        if (state?.error) {
            enqueueSnackbar(state.message, {
                variant: "error",
            });
        }
    });

    return (
        <div>
            <h1 className="text-center text-2xl uppercase font-medium mb-1">Sign In</h1>
            <p className="text-center text-base mb-8">Sign in to place your order.</p>
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
                Not a member?{" "}
                <button className="underline" data-testid="register-button" onClick={() => setCurrentView?.(LOGIN_VIEW.REGISTER)}>
                    Join us
                </button>
                .
            </span>
            <hr className="tb-divider my-6" />
            <GoogleOAuthProvider clientId={process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID as string}>
                <GoogleLogin />
            </GoogleOAuthProvider>
        </div>
    );
};

export default CheckoutLoginForm;
