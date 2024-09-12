import React from "react";
import { IconProps } from "types/icon";

const ChevronDown: React.FC<IconProps> = ({ size = "16", color = "currentColor", ...attributes }) => {
    return (
        <svg fill="none" height={size} viewBox="0 0 16 16" width={size} xmlns="http://www.w3.org/2000/svg" {...attributes}>
            <path d="M4 6L8 10L12 6" stroke={color} strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" />
        </svg>
    );
};

export default ChevronDown;
