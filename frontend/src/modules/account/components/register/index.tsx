"use client";

import { useFormState } from "react-dom";
import { LOGIN_VIEW } from "@modules/account/templates/login-template";
import { signUp } from "@modules/account/actions";
import LocalizedClientLink from "@modules/common/components/localized-client-link";
import { Input } from "@nextui-org/input";
import { useSnackbar } from "notistack";
import useWatch from "@lib/hooks/use-watch";
import { FormButton } from "@modules/common/components/form-button";

type Props = {
    setCurrentView: (view: LOGIN_VIEW) => void; // eslint-disable-line
};

const Register = ({ setCurrentView }: Props) => {
    const { enqueueSnackbar } = useSnackbar();
    const [state, formAction] = useFormState(signUp, null);

    useWatch(state, () => {
        if (state?.error) {
            enqueueSnackbar(state.message, { variant: "error" });
        }
    });

    return (
        <div className="max-w-sm flex flex-col items-center" data-testid="register-page">
            <h1 className="text-lg uppercase mb-6">Become a TBO Store Member</h1>
            <p className="text-center text-base text-default-800 mb-4">
                Create your Store Member profile, and get access to an enhanced shopping experience.
            </p>
            <form action={formAction} className="w-full flex flex-col">
                <div className="flex flex-col w-full gap-y-2">
                    <Input isRequired autoComplete="given-name" data-testid="first-name-input" label="First name" name="first_name" />
                    <Input isRequired autoComplete="family-name" data-testid="last-name-input" label="Last name" name="last_name" />
                    <Input isRequired autoComplete="email" data-testid="email-input" label="Email" name="email" type="email" />
                    <Input autoComplete="tel" data-testid="phone-input" label="Phone" name="phone" type="tel" />
                    <Input isRequired autoComplete="new-password" data-testid="password-input" label="Password" name="password" type="password" />
                </div>
                <span className="text-center text-default-600 text-sm mt-6">
                    By creating an account, you agree to TBI Store&apos;s{" "}
                    <LocalizedClientLink className="underline" href="/content/privacy-policy">
                        Privacy Policy
                    </LocalizedClientLink>{" "}
                    and{" "}
                    <LocalizedClientLink className="underline" href="/content/terms-of-use">
                        Terms of Use
                    </LocalizedClientLink>
                    .
                </span>
                <FormButton className="w-full mt-6" color="warning" data-testid="register-button" size="lg">
                    Join
                </FormButton>
            </form>
            <span className="text-center text-default-800 text-sm mt-6">
                Already a member?{" "}
                <button className="underline" onClick={() => setCurrentView(LOGIN_VIEW.SIGN_IN)}>
                    Sign in
                </button>
                .
            </span>
        </div>
    );
};

export default Register;
