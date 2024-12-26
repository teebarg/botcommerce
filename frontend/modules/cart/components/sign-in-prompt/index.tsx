import Button from "@modules/common/components/button";
import LocalizedClientLink from "@modules/common/components/localized-client-link";

const SignInPrompt = () => {
    return (
        <div className="flex items-center justify-between">
            <div>
                <h2 className="text-lg font-semibold">Already have an account?</h2>
                <p className="text-sm md:text-base text-default-500">Sign in for a better experience.</p>
            </div>
            <div>
                <LocalizedClientLink
                    data-testid="sign-in-button"
                    href="/account"
                    className="relative inline-flex items-center justify-center outline-none py-2 rounded-small bg-transparent border border-secondary-500 text-secondary-900 min-w-28"
                >
                    Sign in
                </LocalizedClientLink>
            </div>
        </div>
    );
};

export default SignInPrompt;
