import { Link } from "@tanstack/react-router";
import type React from "react";

interface TransitionLinkProps {
    children: React.ReactNode;
    href: string;
    className?: string;
    active?: string;
    [key: string]: any;
}

const LocalizedClientLink: React.FC<TransitionLinkProps> = ({ children, href, className, active, ...props }) => {
    return (
        <Link {...props} className={className} activeProps={{ className: active }} activeOptions={{ exact: true }} to={href}>
            {children}
        </Link>
    );
};

export default LocalizedClientLink;
