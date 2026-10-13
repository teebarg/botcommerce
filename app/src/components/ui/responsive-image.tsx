import * as React from "react";
import { buildSrcSet, splitImageProps, buildTransformUrl } from "@/lib/image-helpers";
import { useResponsiveImage, UseResponsiveImageProps } from "@/hooks/use-responsive-image";
import { cn } from "@/utils/cn";

export interface ResponsiveImageProps extends UseResponsiveImageProps {
    src: string;
    style?: React.CSSProperties;
    aspectRatio?: string;
    // Accept standard HTML image attributes (like alt, crossOrigin, sizes, etc.)
    [key: string]: any;
}

export const ResponsiveImage = React.forwardRef<HTMLImageElement, ResponsiveImageProps>(
    ({ src, parsed, fittingType, focalPoint, quality, className, style, aspectRatio, onLoad, onSourceChange, ...props }, ref) => {
        const { wrapperRef, imgRef, loaded, options, handleLoad } = useResponsiveImage(
            { parsed, fittingType, focalPoint, quality, className, onLoad, onSourceChange },
            ref
        );

        // Infers standard image splitting behavior
        const { wrapperProps, imageProps } = splitImageProps(props);

        return (
            <span
                ref={wrapperRef}
                className={cn("inline-block relative", className)}
                style={{ aspectRatio, ...style }}
                {...wrapperProps}
                data-base44-image=""
                data-base44-image-src={src}
            >
                {/* Contain both image layers inside the padded content box without adding an edit target. */}
                <span data-source-location={undefined} className="block relative w-full h-full overflow-hidden">
                    {options && !loaded && (
                        <img
                            data-source-location={undefined}
                            src={buildTransformUrl(parsed, {
                                ...options,
                                width: 20,
                                height: options.height ? Math.max(1, Math.round((20 * options.height) / options.width)) : undefined,
                                quality: 20,
                            })}
                            alt=""
                            aria-hidden="true"
                            className="w-full h-full inset-0 absolute"
                            style={{
                                objectFit: fittingType === "fit" ? "contain" : "cover",
                                filter: "blur(10px)",
                                transform: "scale(1.1)",
                            }}
                        />
                    )}

                    {options && (
                        <img
                            data-source-location={undefined}
                            ref={imgRef}
                            src={buildTransformUrl(parsed, options)}
                            srcSet={buildSrcSet(parsed, options)}
                            loading="lazy"
                            className={cn("w-full h-full inset-0 absolute", fittingType === "fit" ? "object-contain" : "object-cover")}
                            onLoad={handleLoad}
                            {...imageProps}
                        />
                    )}
                </span>
            </span>
        );
    }
);

ResponsiveImage.displayName = "ResponsiveImage";
