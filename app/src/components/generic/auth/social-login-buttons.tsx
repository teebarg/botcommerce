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
            <Button className="w-full" disabled={isLoading} isLoading={isLoading} size="lg" onClick={handleSocialLogin}>
                <img alt="Google" className="mr-2" height={20} src="/google.svg" width={20} />
                Continue with Google
            </Button>
        </div>
    );
}
