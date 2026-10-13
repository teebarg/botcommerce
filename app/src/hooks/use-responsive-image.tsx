import * as React from "react";
import { useSize } from "@/hooks/use-size";
import { cn } from "@/utils/cn";
import { DEFAULT_TRANSFORM_WIDTH, getImagePreviewClassName } from "@/lib/image-helpers";

export interface ParsedImageSource {
    baseUrl: string;
}

export interface FocalPoint {
    x: number;
    y: number;
}

export interface UseResponsiveImageProps {
    parsed: ParsedImageSource;
    fittingType?: "fill" | "fit" | string;
    focalPoint?: FocalPoint;
    quality?: number;
    className?: string;
    onLoad?: React.ReactEventHandler<HTMLImageElement>;
    onSourceChange: (src: string, className?: string) => void;
}

export interface ImageTransformOptions {
    width: number;
    height: number | undefined;
    crop: boolean;
    focalPoint: FocalPoint | undefined;
    quality?: number;
}

export interface UseResponsiveImageReturn {
    wrapperRef: React.RefObject<HTMLDivElement | null>;
    imgRef: React.RefObject<HTMLImageElement | null>;
    loaded: boolean;
    options: ImageTransformOptions | null;
    handleLoad: React.ReactEventHandler<HTMLImageElement>;
}

// Custom event mapping for the Wix visual editor replacement event
interface ImageReplaceEventDetail {
    src: string;
}

interface ImageReplaceEvent extends Event {
    detail: ImageReplaceEventDetail;
}

export function useResponsiveImage(
    { parsed, fittingType, focalPoint, quality, className, onLoad, onSourceChange }: UseResponsiveImageProps,
    parentRef: React.ForwardedRef<HTMLImageElement | null>
): UseResponsiveImageReturn {
    const wrapperRef = React.useRef<HTMLDivElement>(null);
    const imgRef = React.useRef<HTMLImageElement>(null);
    const size = useSize(wrapperRef);
    const [loaded, setLoaded] = React.useState(false);

    // Forward the inner img element ref back up to parent components
    React.useImperativeHandle(parentRef, () => imgRef.current);

    React.useEffect(() => setLoaded(false), [parsed.baseUrl]);

    React.useEffect(() => {
        const wrapper = wrapperRef.current;
        if (!wrapper) return;

        const replace = (event: Event) => {
            const customEvent = event as ImageReplaceEvent;
            onSourceChange(customEvent.detail.src, getImagePreviewClassName(className, wrapper.className, cn("inline-block relative", className)));
        };

        wrapper.addEventListener("base44:image-replace", replace);
        return () => wrapper.removeEventListener("base44:image-replace", replace);
    }, [className, onSourceChange]);

    const crop = fittingType !== "fit";

    // Wait for useSize's pre-paint measurement before requesting a transform.
    const options: ImageTransformOptions | null = size
        ? {
              width: size.width || DEFAULT_TRANSFORM_WIDTH,
              height: size.height || undefined,
              crop,
              focalPoint: crop ? focalPoint : undefined,
              quality,
          }
        : null;

    return {
        wrapperRef,
        imgRef,
        loaded,
        options,
        handleLoad: (event) => {
            setLoaded(true);
            onLoad?.(event);
        },
    };
}
