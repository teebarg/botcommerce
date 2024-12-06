import React from "react";
import clsx from "clsx";

interface BadgeProps {
    children: React.ReactNode;
    content?: React.ReactNode | string;
    color?: "primary" | "secondary" | "default" | "danger" | "warning" | "success";
    placement?: "top-right" | "bottom-right" | "top-left" | "bottom-left";
    size?: "sm" | "md" | "lg";
    isBordered?: boolean;
}

const Badge: React.FC<BadgeProps> = ({ children, content, isBordered = false, color = "primary", placement = "bottom-right", size = "sm" }) => {
    return (
        <React.Fragment>
            <div className="relative inline-flex shrink-0">
                <span
                    className={clsx(
                        "flex relative justify-center items-center box-border overflow-hidden align-middle z-0 outline-none rounded-medium",
                        `bg-${color} text-${color}-foreground`,
                        {
                            "ring-2 ring-offset-2 ring-offset-background dark:ring-offset-background-dark ring-success": isBordered,
                            "w-10 h-10": size == "sm",
                            "w-12 h-12": size == "md",
                            "w-14 h-14": size == "lg",
                        }
                    )}
                >
                    {children}
                </span>
                <span
                    className={clsx(
                        "flex z-10 flex-wrap absolute box-border rounded-full whitespace-nowrap place-content-center origin-center items-center select-none font-regular px-0 border-2 border-background",
                        `bg-${color} text-${color}-foreground`,
                        {
                            "text-tiny w-4 h-4 min-w-4 min-h-4": size == "sm",
                            "text-small w-5 h-5 min-w-5 min-h-5": size == "md",
                            "text-small w-6 h-6 min-w-6 min-h-6": size == "lg",
                            "top-[5%] right-[5%] translate-x-1/2 -translate-y-1/2": placement == "top-right",
                            "bottom-[5%] right-[5%] translate-x-1/2 translate-y-1/2": placement == "bottom-right",
                            "top-[5%] left-[5%] -translate-x-1/2 -translate-y-1/2": placement == "top-left",
                            "bottom-[5%] left-[5%] -translate-x-1/2 translate-y-1/2": placement == "bottom-left",
                        }
                    )}
                >
                    {content}
                </span>
            </div>
        </React.Fragment>
    );
};

export { Badge };