import Image from "next/image";
import React from "react";

import { IconProps } from "@/types/models";
import { cn } from "@/lib/util/cn";

type ThumbnailProps = {
    thumbnail?: string | null;
    images?: any[] | null;
    size?: "small" | "medium" | "large" | "full" | "square";
    isFeatured?: boolean;
    className?: string;
    "data-testid"?: string;
};

const PlaceholderImage: React.FC<IconProps> = ({ size = "20", color = "currentColor", ...attributes }) => {
    return (
        <svg fill="none" height={size} viewBox="0 0 20 20" width={size} xmlns="http://www.w3.org/2000/svg" {...attributes}>
            <path
                d="M15.3141 3.16699H4.68453C3.84588 3.16699 3.16602 3.84685 3.16602 4.6855V15.3151C3.16602 16.1537 3.84588 16.8336 4.68453 16.8336H15.3141C16.1527 16.8336 16.8326 16.1537 16.8326 15.3151V4.6855C16.8326 3.84685 16.1527 3.16699 15.3141 3.16699Z"
                stroke={color}
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="1.53749"
            />
            <path
                d="M7.91699 9.16699C8.60735 9.16699 9.16699 8.60735 9.16699 7.91699C9.16699 7.22664 8.60735 6.66699 7.91699 6.66699C7.22664 6.66699 6.66699 7.22664 6.66699 7.91699C6.66699 8.60735 7.22664 9.16699 7.91699 9.16699Z"
                stroke={color}
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="1.5"
            />
            <path d="M16.6667 12.5756L13.0208 9.1665L5 16.6665" stroke={color} strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" />
        </svg>
    );
};

const Thumbnail: React.FC<ThumbnailProps> = ({ thumbnail, images, size = "small", isFeatured, className, "data-testid": dataTestid }) => {
    const initialImage = thumbnail || images?.[0]?.url;

    return (
        <div
            className={cn("relative w-full overflow-hidden p-4 rounded-md transition-shadow ease-in-out duration-150", className, {
                "aspect-[11/14]": isFeatured,
                "aspect-[9/16]": !isFeatured && size !== "square",
                "aspect-[1/1]": size === "square",
                "w-[180px]": size === "small",
                "w-[290px]": size === "medium",
                "w-[440px]": size === "large",
                "w-full": size === "full",
            })}
            data-testid={dataTestid}
        >
            <ImageOrPlaceholder image={initialImage} size={size} />
        </div>
    );
};

const ImageOrPlaceholder = ({ image, size }: Pick<ThumbnailProps, "size"> & { image?: string }) => {
    return image ? (
        <Image
            fill
            alt="Thumbnail"
            className="absolute inset-0 object-cover object-center"
            draggable={false}
            quality={50}
            sizes="(max-width: 576px) 280px, (max-width: 768px) 360px, (max-width: 992px) 480px, 800px"
            src={image}
        />
    ) : (
        <div className="w-full h-full absolute inset-0 flex items-center justify-center">
            <PlaceholderImage size={size === "small" ? 16 : 24} />
        </div>
    );
};

export default Thumbnail;
