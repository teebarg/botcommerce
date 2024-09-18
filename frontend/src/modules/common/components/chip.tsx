import React from "react";
import clsx from "clsx";

interface Props {
    title: string;
    color: "default" | "primary" | "secondary" | "success" | "warning" | "danger";
}

const Chip: React.FC<Props> = ({ title, color = "primary" }) => {
    return (
        <React.Fragment>
            <div
                className={clsx(
                    "relative max-w-fit min-w-min inline-flex items-center justify-between",
                    "box-border whitespace-nowrap px-1 h-7 text-small rounded-full",
                    `bg-${color} text-${color}-foreground`
                )}
            >
                <span className="flex-1 text-inherit font-normal px-2">{title}</span>
            </div>
        </React.Fragment>
    );
};

export { Chip };
