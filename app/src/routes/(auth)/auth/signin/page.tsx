import SignInPage from "@/components/generic/auth/signin-page";
import { useNavigate } from "@tanstack/react-router";

type SearchParams = Promise<{ callbackUrl?: string }>;

export default async function SignIn({ searchParams }: { searchParams: SearchParams }) {
    const session: any = null;
    const navigate = useNavigate();

    const sP = await searchParams;

    if (session?.user && sP.callbackUrl) {
        navigate({ to: sP.callbackUrl ?? "/" });
    }

    return <SignInPage />;
}
