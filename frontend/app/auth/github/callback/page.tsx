import OAuthCallbackHandler from "@/components/generic/auth/oauth-callback-handler";

export default function GitHubCallbackPage() {
    return <OAuthCallbackHandler provider="github" />;
}
