import Button from "@modules/common/components/button";
import LocalizedClientLink from "@modules/common/components/localized-client-link";

const SignInPrompt = () => {
    return (
        <div className="flex items-center justify-between">
            <div>
                <h2 className="text-lg">Already have an account?</h2>
                <p className="text-default-500 mt-2">Sign in for a better experience.</p>
            </div>
            <div>
                <LocalizedClientLink href="/account">
                    <Button data-testid="sign-in-button">Sign in</Button>
                </LocalizedClientLink>
            </div>
        </div>
    );
};

export default SignInPrompt;
