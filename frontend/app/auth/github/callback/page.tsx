import OAuthCallbackHandler from "@/components/auth/oauth-callback-handler";

export default function GitHubCallbackPage() {
    return <OAuthCallbackHandler provider="github" />;
}
