import React, { useEffect, useState } from "react";
import { Input } from "@/components/ui/input";
import { Mail } from "lucide-react";
import { Button } from "@/components/ui/button";
import SocialLoginButtons from "@/components/generic/auth/social-login-buttons";
import { Separator } from "@/components/ui/separator";

type Props = {
    callbackUrl?: string;
};

const MagicLinkForm: React.FC<Props> = ({ callbackUrl }) => {
    const [email, setEmail] = useState<string>("");
    const [csrfToken, setCsrfToken] = useState<string>("");

    useEffect(() => {
        fetch("/api/auth/csrf")
            .then((res) => res.json())
            .then((data) => setCsrfToken(data.csrfToken));
    }, []);

    return (
        <React.Fragment>
            <form className="w-full" action="/api/auth/signin/http-email" method="POST">
                <input type="hidden" name="csrfToken" value={csrfToken} />
                <input type="hidden" name="callbackUrl" value={callbackUrl || "/"} />
                <Input
                    required
                    className=""
                    data-testid="email-input"
                    label="Email address"
                    name="email"
                    placeholder="Enter your email address"
                    startContent={<Mail className="text-muted-foreground" />}
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                />
                <Button
                    aria-label="send magic link"
                    className="w-full mt-6"
                    data-testid="magic-link-button"
                    size="lg"
                    type="submit"
                    disabled={!email}
                >
                    Send Magic Link
                </Button>
            </form>
            <Separator className="my-6" />
            <SocialLoginButtons callbackUrl={callbackUrl} />
        </React.Fragment>
    );
};

export { MagicLinkForm };
