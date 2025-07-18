"use client";

import { Pencil, TriangleRightMini } from "nui-react-icons";
import React, { useState, useRef, useEffect } from "react";

import { Button } from "@/components/ui/button";

interface Props {
    email: string;
    onVerify?: (code: string) => void;
    onResend?: () => void;
    onEditEmail?: () => void;
}

const InputOtp: React.FC<Props> = ({ email, onVerify, onResend, onEditEmail }) => {
    const [code, setCode] = useState<string[]>(Array(6).fill(""));
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [error, setError] = useState<string | null>(null);
    const [resendDisabled, setResendDisabled] = useState<boolean>(false);
    const [resendTimer, setResendTimer] = useState(0);

    // Refs for input fields
    const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

    // Handle input change
    const handleInputChange = (index: number, value: string) => {
        // Only allow numbers
        if (!/^\d*$/.test(value)) return;

        const newCode = [...code];

        newCode[index] = value;
        setCode(newCode);

        // Auto-focus next input
        if (value !== "" && index < 5) {
            inputRefs.current[index + 1]?.focus();
        }

        // Clear error when user starts typing
        if (error) setError(null);
    };

    // Handle key press
    const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === "Backspace" && !code[index] && index > 0) {
            // Focus previous input on backspace if current input is empty
            inputRefs.current[index - 1]?.focus();
        }
    };

    // Handle paste
    const handlePaste = (e: React.ClipboardEvent) => {
        e.preventDefault();
        const pastedData = e.clipboardData.getData("text");
        const numbers = pastedData.match(/\d/g)?.slice(0, 6) || [];

        const newCode = [...code];

        numbers.forEach((num, index) => {
            if (index < 6) newCode[index] = num;
        });
        setCode(newCode);

        // Focus appropriate input after paste
        if (numbers.length < 6) {
            inputRefs.current[numbers.length]?.focus();
        }
    };

    // Handle code submission
    const handleSubmit = async () => {
        const completeCode = code.join("");

        if (completeCode.length !== 6) {
            setError("Please enter all 6 digits");

            return;
        }

        setIsLoading(true);
        setError(null);

        try {
            if (onVerify) {
                await onVerify(completeCode);
            }
        } catch (err) {
            setError("Invalid verification code");
        } finally {
            setIsLoading(false);
        }
    };

    // Handle resend code
    const handleResend = async () => {
        onResend?.();
        setResendDisabled(true);
        setResendTimer(30);

        // Reset fields
        setCode(Array(6).fill(""));
        setError(null);
        inputRefs.current[0]?.focus();
    };

    // Resend timer countdown
    useEffect(() => {
        if (resendTimer > 0) {
            const timer = setInterval(() => {
                setResendTimer((prev) => prev - 1);
            }, 1000);

            return () => clearInterval(timer);
        } else {
            setResendDisabled(false);
        }
    }, [resendTimer]);

    return (
        <React.Fragment>
            <div className="w-100 shadow-lg bg-content1">
                <div className="flex flex-col gap-8 text-center px-9 py-8">
                    <div>
                        <div className="flex flex-col gap-1 items-stretch justify-start">
                            <h1 className="font-bold text-lg text-default-900" data-localization-key="signUp.emailCode.title">
                                Verify your email
                            </h1>
                            <p className="font-medium text-sm text-default-500" data-localization-key="signUp.emailCode.subtitle">
                                Enter the verification code sent to your email
                            </p>
                            <div className="flex gap-2 items-center justify-center">
                                <p className="font-medium text-sm text-default-500">{email}</p>
                                <button aria-label="Edit" onClick={onEditEmail}>
                                    <Pencil />
                                </button>
                            </div>
                        </div>
                    </div>
                    <div className="flex flex-col gap-8">
                        <div className="flex flex-col gap-2">
                            <div className="flex flex-col items-start">
                                <div className="flex gap-2 p-1 -ml-1 items-center justify-center">
                                    {Array.from({ length: 6 }).map((_, index: number) => (
                                        <input
                                            key={index}
                                            ref={(el) => {
                                                inputRefs.current[index] = el;
                                            }}
                                            aria-disabled="false"
                                            aria-invalid="false"
                                            aria-label={`Digit-${index + 1}`}
                                            aria-required="false"
                                            autoComplete="one-time-code"
                                            className="text-lg font-bold rounded-md h-10 w-10 text-center bg-background transition-all ease-linear duration-200"
                                            disabled={isLoading}
                                            id={`digit-${index}-field`}
                                            inputMode="numeric"
                                            maxLength={1}
                                            name={`codeInput-${index}`}
                                            type="text"
                                            value={code[index]}
                                            onChange={(e) => handleInputChange(index, e.target.value)}
                                            onKeyDown={(e) => handleKeyDown(index, e)}
                                            onPaste={handlePaste}
                                        />
                                    ))}
                                </div>
                                {error && <p className="text-red-500 text-sm mt-2">{error}</p>}
                            </div>
                            <button
                                aria-label="send"
                                className="font-medium text-sm text-blue-600 hover:text-blue-700
                                     disabled:text-gray-400 disabled:cursor-not-allowed"
                                disabled={resendDisabled}
                                onClick={handleResend}
                            >
                                {resendDisabled ? `Resend code in ${resendTimer}s` : "Didn't receive a code? Resend"}
                            </button>
                        </div>
                        <div>
                            <Button
                                aria-label="submit"
                                className="w-full"
                                color="primary"
                                data-localization-key="formButtonPrimary"
                                disabled={isLoading || code.join("").length !== 6}
                                onClick={handleSubmit}
                            >
                                {isLoading ? (
                                    <div
                                        className="w-5 h-5 border-2 border-white border-t-transparent
                                              rounded-full animate-spin"
                                    />
                                ) : (
                                    <span className="flex items-center justify-start">
                                        Continue
                                        <TriangleRightMini className="w-4 h-4" />
                                    </span>
                                )}
                            </Button>
                        </div>
                    </div>
                </div>
            </div>
        </React.Fragment>
    );
};

export default InputOtp;
