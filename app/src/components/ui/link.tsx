import { Link, useNavigate } from "@tanstack/react-router";
import type React from "react";

interface TransitionLinkProps {
    children: React.ReactNode;
    href: string;
    className?: string;
    active?: string;
    [key: string]: any;
}

const LocalizedClientLink: React.FC<TransitionLinkProps> = ({ children, href, className, active, ...props }) => {
    const navigate = useNavigate();

    return (
        <Link
            {...props}
            className={className}
            activeProps={{ className: active }}
            activeOptions={{ exact: true }}
            to={href}
            onClick={(e) => {
                e.preventDefault();
                navigate({ to: href.toString() });
            }}
        >
            {children}
        </Link>
    );
};

export default LocalizedClientLink;
