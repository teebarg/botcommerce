import * as React from "react";
import { ResponsiveImage } from "@/components/ui/responsive-image";
import { getOriginalImageUrl, IMAGE_LOAD_MODE, nextImageLoadMode } from "@/lib/image-helpers";

type ImageLoadMode = (typeof IMAGE_LOAD_MODE)[keyof typeof IMAGE_LOAD_MODE];

export interface ImageProps extends Omit<React.ComponentPropsWithRef<"img">, "src"> {
    src?: string | null;
    fittingType?: "fill" | "fit" | string;
    originWidth?: number;
    originHeight?: number;
    focalPointX?: number;
    focalPointY?: number;
    quality?: number;
}

interface PreviewSourceState {
    source: string | null;
    value: string;
    className?: string;
    sourceClassName?: string;
}

interface LoadState {
    src: string | null;
    mode: ImageLoadMode;
}

const baseUrl = typeof window === "undefined" ? process.env.BASE_URL : import.meta.env.VITE_BASE_URL;

const FALLBACK_IMAGE_URL = `${baseUrl}/placeholder.jpg`

/**
 * Image with built-in Wix Media Platform support: canonical public images are resized to the rendered
 * container per device pixel ratio and served as AVIF/WebP when supported; `fittingType="fill"`
 * crops server-side, optionally anchored at a focal point. Other URLs render
 * as a plain <img>. Failed transforms retry the original URL; only a broken
 * original swaps to the generic fallback image.
 */
const Image = React.forwardRef<HTMLImageElement, ImageProps>(
    (
        {
            src: source = null,
            fittingType = "fill",
            originWidth,
            originHeight,
            focalPointX,
            focalPointY,
            quality = 90,
            onError,
            className: originalClassName,
            ...props
        },
        ref
    ) => {
        const [previewSource, setPreviewSource] = React.useState<PreviewSourceState | null>(null);
        const preview = previewSource?.source === source ? previewSource : null;
        const src = preview ? preview.value : source;

        const replaceSource = (value: string, className?: string) =>
            setPreviewSource({
                source,
                value,
                className,
                sourceClassName: originalClassName,
            });

        React.useEffect(() => setPreviewSource(null), [source]);
        const parsedSource = src && src !== FALLBACK_IMAGE_URL ? null : null;
        const initialMode = IMAGE_LOAD_MODE.ORIGINAL;

        const [loadState, setLoadState] = React.useState<LoadState>({ src, mode: initialMode });
        const mode = loadState.src === src ? loadState.mode : initialMode;

        React.useEffect(() => {
            setLoadState({ src, mode: initialMode });
        }, [src, initialMode]);

        const handleError = (event: React.SyntheticEvent<HTMLImageElement, Event>) => {
            if (mode === IMAGE_LOAD_MODE.FALLBACK) return;
            const nextMode = nextImageLoadMode(mode);
            setLoadState({ src, mode: nextMode });
            if (nextMode === IMAGE_LOAD_MODE.FALLBACK) onError?.(event);
        };

        const currentClassName = preview && preview.sourceClassName === originalClassName ? preview.className : originalClassName;

        const imageProps = {
            ...props,
            className: currentClassName,
            onError: handleError,
        };

        if (!src) {
            // Renders as a real <img> (not a <div>) — the visual editor's
            // click-to-edit toolbar keys its "Replace Image" action off the DOM
            // tag being `img`, so a placeholder div would be unrecoverable in the
            // editor. FALLBACK_IMAGE_URL doubles as the "no image chosen" graphic.
            return <img ref={ref} src={FALLBACK_IMAGE_URL} {...imageProps} data-empty-image="" />;
        }

        // A failed transform retries the underlying original as a plain image.
        // Only a failure of that original advances to the generic fallback.
        const parsed = mode === IMAGE_LOAD_MODE.OPTIMIZED ? parsedSource : null;

        if (!parsed) {
            const isErrorMode = mode === IMAGE_LOAD_MODE.FALLBACK;
            const imageSrc = isErrorMode ? FALLBACK_IMAGE_URL : getOriginalImageUrl(src, parsedSource);
            return <img ref={ref} src={imageSrc} {...imageProps} data-error-image={isErrorMode ? "" : undefined} />;
        }

        const focalPoint = typeof focalPointX === "number" && typeof focalPointY === "number" ? { x: focalPointX, y: focalPointY } : undefined;

        // Origin dimensions are optional — when known they stabilize layout via
        // the wrapper's aspect-ratio before the image loads.
        const aspectRatio = originWidth && originHeight ? `${originWidth} / ${originHeight}` : undefined;

        return (
            <ResponsiveImage
                ref={ref}
                src={src}
                parsed={parsed}
                onSourceChange={replaceSource}
                fittingType={fittingType}
                focalPoint={focalPoint}
                quality={quality}
                aspectRatio={aspectRatio}
                {...imageProps}
            />
        );
    }
);

Image.displayName = "Image";

export { Image };
