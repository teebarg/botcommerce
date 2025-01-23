"use client";

import Link, { LinkProps } from "next/link";
import React, { startTransition } from "react";
import { useRouter } from "next/navigation";
import { useProgressBar } from "@/components/ui/progress-bar";

interface TransitionLinkProps extends LinkProps {
    children: React.ReactNode;
    href: string;
    className?: string;
}

const LocalizedClientLink: React.FC<TransitionLinkProps> = ({ children, href, ...props }) => {
    const router = useRouter();
    let progress = useProgressBar();

    return (
        <Link
            {...props}
            href={href}
            onClick={(e) => {
                e.preventDefault();
                progress.start();

                startTransition(() => {
                    router.push(href.toString());
                    progress.done();
                });
            }}
        >
            {children}
        </Link>
    );
};

export default LocalizedClientLink;
