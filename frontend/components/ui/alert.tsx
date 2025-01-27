import { cn } from "@/lib/util/cn";
import { CheckCircleSolid, InformationCircleSolid, Shield } from "nui-react-icons";
import React from "react";

interface Props {
    title: string;
    color?: "primary" | "secondary" | "default" | "danger" | "warning" | "success" | undefined;
    variant?: "solid" | "bordered" | "light" | "flat" | "faded" | "Shadow";
}

const Alert: React.FC<Props> = ({ title, color = "primary", variant = "solid" }) => {
    const colorCss = {
        default: {
            outer: "bg-default-100 dark:bg-default-50/50 text-default-foreground",
            inner: "bg-default-50 dark:bg-default-100 border-default-200",
            icon: <InformationCircleSolid viewBox="0 0 20 20" />,
        },
        primary: {
            outer: "text-primary-500 bg-primary-100/50 dark:bg-primary-100/50",
            inner: "bg-primary-100/50 dark:bg-primary-100 border-primary-100",
            icon: <InformationCircleSolid viewBox="0 0 20 20" />,
        },
        secondary: {
            outer: "text-secondary-500 bg-secondary-100/50 dark:bg-secondary-100/50",
            inner: "bg-secondary-100/50 dark:bg-secondary-100 border-secondary-100",
            icon: <InformationCircleSolid viewBox="0 0 20 20" />,
        },
        danger: {
            outer: "text-danger-600 dark:text-danger-500 bg-danger-50 dark:bg-danger-50/60",
            inner: "bg-danger-50 dark:bg-danger-100 border-danger-100",
            icon: (
                <svg
                    fill="none"
                    height="20"
                    viewBox="0 0 20 20"
                    width="20"
                    xmlns="http://www.w3.org/2000/svg"
                    className="fill-current w-6 absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2"
                >
                    <path d="M17.51 3.85L11.57 0.42C10.6 -0.14 9.4 -0.14 8.42 0.42L2.49 3.85C1.52 4.41 0.919998 5.45 0.919998 6.58V13.42C0.919998 14.54 1.52 15.58 2.49 16.15L8.43 19.58C9.4 20.14 10.6 20.14 11.58 19.58L17.52 16.15C18.49 15.59 19.09 14.55 19.09 13.42V6.58C19.08 5.45 18.48 4.42 17.51 3.85ZM9.25 5.75C9.25 5.34 9.59 5 10 5C10.41 5 10.75 5.34 10.75 5.75V11C10.75 11.41 10.41 11.75 10 11.75C9.59 11.75 9.25 11.41 9.25 11V5.75ZM10.92 14.63C10.87 14.75 10.8 14.86 10.71 14.96C10.52 15.15 10.27 15.25 10 15.25C9.87 15.25 9.74 15.22 9.62 15.17C9.49 15.12 9.39 15.05 9.29 14.96C9.2 14.86 9.13 14.75 9.07 14.63C9.02 14.51 9 14.38 9 14.25C9 13.99 9.1 13.73 9.29 13.54C9.39 13.45 9.49 13.38 9.62 13.33C9.99 13.17 10.43 13.26 10.71 13.54C10.8 13.64 10.87 13.74 10.92 13.87C10.97 13.99 11 14.12 11 14.25C11 14.38 10.97 14.51 10.92 14.63Z" />
                </svg>
            ),
        },
        warning: {
            outer: "text-warning-700 dark:text-warning bg-warning-50 dark:bg-warning-50/50",
            inner: "bg-warning-50 dark:bg-warning-100 border-warning-100",
            icon: <Shield />,
        },
        success: {
            outer: "text-success-700 dark:text-success bg-success-50 dark:bg-success-50/50",
            inner: "bg-success-50 dark:bg-success-100 border-success-100",
            icon: <CheckCircleSolid />,
        },
    };
    return (
        <React.Fragment>
            <div className="w-full flex items-center my-3">
                <div
                    role="alert"
                    title={title}
                    className={cn("flex flex-grow flex-row w-full py-3 px-4 gap-x-1 rounded-medium items-start", colorCss[color].outer)}
                >
                    <div
                        className={cn("flex-none relative w-9 h-9 rounded-full grid place-items-center shadow-small border-1", colorCss[color].inner)}
                    >
                        {colorCss[color].icon}
                    </div>
                    <div className="h-full flex-grow min-h-10 ms-2 flex flex-col box-border text-inherit justify-center items-center">
                        <div className="text-small w-full font-medium block text-inherit leading-5">{title}</div>
                    </div>
                </div>
            </div>
        </React.Fragment>
    );
};

export default Alert;
