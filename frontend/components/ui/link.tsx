"use client";

import Link, { LinkProps } from "next/link";
import React, { startTransition } from "react";
import { usePathname, useRouter } from "next/navigation";

import { useProgressBar } from "@/components/ui/progress-bar";
import { cn } from "@/lib/utils";

interface TransitionLinkProps extends LinkProps {
    children: React.ReactNode;
    href: string;
    className?: string;
    active?: string;
}

const LocalizedClientLink: React.FC<TransitionLinkProps> = ({ children, href, className, active, ...props }) => {
    const router = useRouter();
    const pathname = usePathname();
    let progress = useProgressBar();

    return (
        <Link
            {...props}
            prefetch
            className={cn(className, pathname == href && active)}
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
