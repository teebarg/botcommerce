import { BtnLink } from "@/components/ui/btnLink";

const SignInPrompt = () => {
    return (
        <div className="flex items-center justify-between">
            <div>
                <h2 className="text-lg font-semibold">Already have an account?</h2>
                <p className="text-sm md:text-base text-default-500">Sign in for a better experience.</p>
            </div>
            <div>
                <BtnLink color="secondary" data-testid="sign-in-button" href="/account" variant="bordered">
                    Sign in
                </BtnLink>
            </div>
        </div>
    );
};

export default SignInPrompt;
