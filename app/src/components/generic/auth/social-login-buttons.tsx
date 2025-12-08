import { useEffect, useState } from "react";

import { Button } from "@/components/ui/button";

type Props = {
    callbackUrl?: string;
};

export default function SocialLoginButtons({ callbackUrl }: Props) {
    const [isLoading, setIsLoading] = useState<boolean>(false);

    const [csrfToken, setCsrfToken] = useState<string>("");

    useEffect(() => {
        fetch("/api/auth/csrf")
            .then((res) => res.json())
            .then((data) => setCsrfToken(data.csrfToken));
    }, []);

    return (
        <div className="space-y-3">
            <form action="/api/auth/signin/google" method="POST">
                <input type="hidden" name="csrfToken" value={csrfToken} />
                <input type="hidden" name="callbackUrl" value={callbackUrl || "/"} />
                <Button className="w-full" disabled={isLoading} isLoading={isLoading} size="lg" type="submit">
                    <img alt="Google" className="mr-2" height={20} src="/google.svg" width={20} />
                    Continue with Google
                </Button>
            </form>
        </div>
    );
}
