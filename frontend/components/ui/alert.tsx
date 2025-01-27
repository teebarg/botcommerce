import { CheckCircleSolid, ExclamationIcon, InformationCircleSolid, Shield } from "nui-react-icons";
import React from "react";

import { cn } from "@/lib/util/cn";

interface Props {
    title: string;
    color?: "primary" | "secondary" | "default" | "danger" | "warning" | "success" | undefined;
    variant?: "solid" | "bordered";
}

const Alert: React.FC<Props> = ({ title, color = "primary", variant = "solid" }) => {
    const colorCss = {
        default: {
            outer: "",
            inner: "bg-default-50 dark:bg-default-100 border-default-200",
            icon: <InformationCircleSolid viewBox="0 0 20 20" />,
            variant: {
                bordered: "border-1 bg-transparent border-default text-default",
                solid: "bg-default-100 dark:bg-default-50/50 text-default-foreground",
            },
        },
        primary: {
            outer: "",
            inner: "bg-primary-100/50 dark:bg-primary-100 border-primary-100",
            icon: <InformationCircleSolid viewBox="0 0 20 20" />,
            variant: {
                bordered: "border-1 bg-transparent border-primary text-primary",
                solid: "text-primary-500 bg-primary-100/50 dark:bg-primary-100/50",
            },
        },
        secondary: {
            outer: "",
            inner: "bg-secondary-100/50 dark:bg-secondary-100 border-secondary-100",
            icon: <InformationCircleSolid className="fill-current" viewBox="0 0 20 20" />,
            variant: {
                bordered: "border-1 bg-transparent border-secondary text-secondary",
                solid: "bg-secondary-100/50 dark:bg-secondary-100/50 text-secondary-500",
            },
        },
        danger: {
            outer: "",
            inner: "bg-danger-50 dark:bg-danger-100 border-danger-100",
            icon: <ExclamationIcon />,
            variant: {
                bordered: "border-1 bg-transparent border-danger text-danger",
                solid: "text-danger-600 dark:text-danger-500 bg-danger-50 dark:bg-danger-50/60",
            },
        },
        warning: {
            outer: "",
            inner: "bg-warning-50 dark:bg-warning-100 border-warning-100",
            icon: <Shield />,
            variant: {
                bordered: "border-1 bg-transparent border-warning text-warning",
                solid: "text-warning-700 dark:text-warning bg-warning-50 dark:bg-warning-50/50",
            },
        },
        success: {
            outer: "",
            inner: "bg-success-50 dark:bg-success-100 border-success-100",
            icon: <CheckCircleSolid />,
            variant: {
                bordered: "border-1 bg-transparent border-success text-success",
                solid: "text-success-700 dark:text-success bg-success-50 dark:bg-success-50/50",
            },
        },
    };

    return (
        <React.Fragment>
            <div className="w-full flex items-center my-3">
                <div
                    className={cn(
                        "flex flex-grow flex-row w-full py-3 px-4 gap-x-1 rounded-xl items-start",
                        colorCss[color].outer,
                        colorCss[color].variant[variant]
                    )}
                    role="alert"
                    title={title}
                >
                    <div
                        className={cn("flex-none relative w-9 h-9 rounded-full grid place-items-center shadow-small border-1", colorCss[color].inner)}
                    >
                        {colorCss[color].icon}
                    </div>
                    <div className="h-full flex-grow min-h-10 ms-2 flex flex-col box-border text-inherit justify-center items-center">
                        <div className="text-sm w-full font-medium block text-inherit leading-5">{title}</div>
                    </div>
                </div>
            </div>
        </React.Fragment>
    );
};

export default Alert;
