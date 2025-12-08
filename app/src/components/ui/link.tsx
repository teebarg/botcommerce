import { Link, useLocation, useNavigate } from "@tanstack/react-router";
import type React from "react";
import { startTransition } from "react";

import { useProgressBar } from "@/components/ui/progress-bar";
import { cn } from "@/utils";

interface TransitionLinkProps {
    children: React.ReactNode;
    href: string;
    className?: string;
    active?: string;
    [key: string]: any;
}

const LocalizedClientLink: React.FC<TransitionLinkProps> = ({ children, href, className, active, ...props }) => {
    const navigate = useNavigate();
    // const location = useLocation();
    // const pathname = location.pathname;
    const progress = useProgressBar();

    return (
        <Link
            {...props}
            className={className}
            activeProps={{ className: active }}
            activeOptions={{ exact: true }}
            to={href}
            onClick={(e) => {
                e.preventDefault();
                progress.start();

                startTransition(() => {
                    navigate({ to: href.toString() });
                    progress.done();
                });
            }}
        >
            {children}
        </Link>
    );
};

export default LocalizedClientLink;
