import { SignIn } from "@clerk/tanstack-react-start";

export function SignInRedirect(): React.ReactNode {
    return (
        <div className="flex items-center justify-center p-12">
            <SignIn routing="hash" forceRedirectUrl={`/auth/callback?redirect=${typeof window !== "undefined" ? window.location.pathname : ""}`} />
        </div>
    );
}
