import React, { useEffect, useState } from "react";
import { Input } from "@/components/ui/input";
import { Mail } from "lucide-react";
import { Button } from "@/components/ui/button";
import SocialLoginButtons from "@/components/generic/auth/social-login-buttons";
import { Separator } from "@/components/ui/separator";

type Props = {
    callbackUrl?: string;
};

const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/i; // practical validation, not RFC-perfect

const MagicLinkForm: React.FC<Props> = ({ callbackUrl }) => {
    const [email, setEmail] = useState<string>("");
    const [csrfToken, setCsrfToken] = useState<string>("");
    const [error, setError] = useState<string>("");

    useEffect(() => {
        fetch("/api/auth/csrf")
            .then((res) => res.json())
            .then((data) => setCsrfToken(data.csrfToken));
    }, []);

    const isValidEmail = (value: string) => {
        return emailRegex.test(value.trim());
    };

    const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
        if (!isValidEmail(email)) {
            e.preventDefault();
            setError("Please enter a valid email address.");
            return;
        }

        setError("");
    };

    const handleChange = (value: string) => {
        setEmail(value);

        if (error) {
            if (isValidEmail(value)) {
                setError("");
            }
        }
    };

    const emailIsValid = isValidEmail(email);

    return (
        <>
            <form className="w-full" action="/api/auth/signin/http-email" method="POST" onSubmit={handleSubmit} noValidate>
                <input type="hidden" name="csrfToken" value={csrfToken} />
                <input type="hidden" name="callbackUrl" value={callbackUrl || "/"} />

                <Input
                    required
                    data-testid="email-input"
                    label="Email address"
                    name="email"
                    placeholder="Enter your email address"
                    startContent={<Mail className="text-muted-foreground" />}
                    type="email"
                    value={email}
                    onChange={(e) => handleChange(e.target.value)}
                    aria-invalid={!!error}
                />

                {error && <p className="text-sm text-red-500 mt-2">{error}</p>}

                <Button
                    aria-label="send magic link"
                    className="w-full mt-6 gradient-primary"
                    data-testid="magic-link-button"
                    size="lg"
                    type="submit"
                    disabled={!emailIsValid}
                >
                    Send Magic Link
                </Button>
            </form>

            <Separator className="my-6" />

            <SocialLoginButtons callbackUrl={callbackUrl} />
        </>
    );
};

export { MagicLinkForm };
