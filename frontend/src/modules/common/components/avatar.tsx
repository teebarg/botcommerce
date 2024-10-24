import React from "react";
import clsx from "clsx";

interface AvatarProps {
    src: string;
    className: string;
    color?: "primary" | "secondary" | "default" | "danger" | "warning" | "success";
    radius?: "sm" | "md" | "lg" | "full";
    size?: "sm" | "md" | "lg";
    isDisabled?: boolean;
}

const Avatar: React.FC<AvatarProps> = ({ className, src, isDisabled = false, color = "primary", size = "sm", radius = "full" }) => {
    return (
        <React.Fragment>
            <span
                className={clsx(
                    "flex relative justify-center items-center box-border overflow-hidden align-middle z-0 outline-none",
                    `ring-2 ring-offset-2 ring-offset-background dark:ring-offset-background-dark ring-${color}`,
                    className,
                    {
                        "w-8 h-8": size === "sm",
                        "w-10 h-10": size === "md",
                        "w-14 h-14": size === "lg",
                        "opacity-disabled": isDisabled,
                        "rounded-full": radius === "full",
                        "rounded-large": radius === "md",
                        "rounded-medium": radius === "lg",
                        "rounded-small": radius === "sm",
                    }
                )}
            >
                <img alt="avatar" className="flex object-cover w-full h-full" src={src} />
            </span>
        </React.Fragment>
    );
};

export { Avatar };
