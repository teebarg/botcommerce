"use client";

import { useState } from "react";
import { useSearchParams } from "next/navigation";
import { signIn } from "next-auth/react";

import { Button } from "@/components/ui/button";

type Props = {
    callbackUrl?: string;
};

export default function SocialLoginButtons({ callbackUrl }: Props) {
    const searchParams = useSearchParams();
    const [isLoading, setIsLoading] = useState<boolean>(false);

    const handleSocialLogin = async () => {
        setIsLoading(true);
        signIn("google", { callbackUrl: callbackUrl || searchParams.get("callbackUrl") || "/" });
    };

    return (
        <div className="space-y-3">
            <Button className="w-full" disabled={isLoading} isLoading={isLoading} size="md" variant="primary" onClick={handleSocialLogin}>
                <img alt="Google" className="w-5 h-5 mr-2" src="/google.svg" />
                Continue with Google
            </Button>
        </div>
    );
}
