import React from "react";
import { IconProps } from "types/icon";

const X: React.FC<IconProps> = ({ size = "20", color = "currentColor", ...attributes }) => {
    return (
        <svg fill="none" height={size} viewBox="0 0 20 20" width={size} xmlns="http://www.w3.org/2000/svg" {...attributes}>
            <path d="M15 5L5 15" stroke={color} strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" />
            <path d="M5 5L15 15" stroke={color} strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" />
        </svg>
    );
};

export default X;
