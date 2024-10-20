"use client";

import { FC, useEffect, useState } from "react";
import { useCookie } from "@lib/hooks/use-cookie";
import Link from "next/link";
import Button from "@modules/common/components/button";

export interface CookieProps {}

export const Cookie: FC<CookieProps> = () => {
    const { getCookie, setCookie } = useCookie();
    const [showCookie, setShowCookie] = useState<boolean>(false);

    useEffect(() => {
        const acceptCookie = getCookie("tbo_cookie");

        if (acceptCookie) {
            setShowCookie(false);
        }
    }, []);

    const handleCookie = () => {
        setShowCookie(false);
        setCookie("tbo_cookie", true);
    };

    return (
        <div className={showCookie ? "" : "hidden"}>
            <div className="pointer-events-none fixed inset-x-0 bottom-0 px-6 pb-6 z-50">
                <div className="pointer-events-auto ml-auto max-w-sm rounded-large border border-divider bg-background/95 p-6 shadow-small backdrop-blur">
                    <p className="text-small font-normal text-default-700">
                        {`We use cookies on our website to give you the most relevant experience by remembering your preferences and repeat visits. By`}
                        clicking<b className="font-semibold">{`"Accept All"`}</b>, you consent to the use of ALL the cookies. However, you may visit
                        <span className="font-semibold">{`"Cookie Settings"`}</span>
                        to provide a controlled consent. For more information, please read our
                        <Link className="inline-flex text-primary hover:underline hover:opacity-80" href="/">
                            Cookie Policy.
                        </Link>
                    </p>
                    <div className="mt-4 space-y-2">
                        <Button
                            className="w-full"
                            style={{
                                border: "2px solid transparent",
                                backgroundImage:
                                    "linear-gradient(hsl(var(--nextui-background)), hsl(var(--nextui-background))),linear-gradient(83.87deg, #f54180, #9353d3)",
                                backgroundOrigin: "border-box",
                                backgroundClip: "padding-box, border-box",
                            }}
                            onPress={handleCookie}
                        >
                            Accept All
                        </Button>
                        <Button className="border-medium w-full bg-transparent border-default-200 font-medium">Reject All</Button>
                    </div>
                </div>
            </div>
        </div>
    );
};
