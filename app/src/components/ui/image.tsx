import * as React from "react";
import { APP_URL } from "@/utils";

const IMAGE_LOAD_MODE = {
    ORIGINAL: "original",
    FALLBACK: "fallback",
} as const;

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

const FALLBACK_IMAGE_URL = `${APP_URL}/placeholder.jpg`;

/**
 * Optional responsive images. Set VITE_IMAGE_RESIZE_BASE to an image-resizing endpoint that accepts
 * `<base>/width=<w>,quality=<q>,format=auto/<absolute source url>` (Cloudflare Image Resizing's
 * `https://your-zone/cdn-cgi/image` does). When it is unset nothing changes: the original URL is
 * used and no srcset is emitted, so this is safe to ship before the CDN is configured.
 */
const RESIZE_BASE = (import.meta.env.VITE_IMAGE_RESIZE_BASE as string | undefined)?.replace(/\/$/, "");
const SRCSET_WIDTHS = [320, 480, 640, 960, 1280];

function buildSrcSet(source: string, quality: number): string | undefined {
    if (!RESIZE_BASE || !/^https?:\/\//.test(source)) return undefined;
    return SRCSET_WIDTHS.map((w) => `${RESIZE_BASE}/width=${w},quality=${quality},format=auto/${source} ${w}w`).join(", ");
}

const Image = React.forwardRef<HTMLImageElement, ImageProps>(
    (
        {
            src: source = null,
            fittingType = "fill",
            originWidth,
            originHeight,
            focalPointX,
            focalPointY,
            quality = 80,
            onError,
            sizes,
            className: originalClassName,
            ...props
        },
        ref
    ) => {
        const [previewSource, setPreviewSource] = React.useState<PreviewSourceState | null>(null);
        const preview = previewSource?.source === source ? previewSource : null;
        const src = preview ? preview.value : source;

        React.useEffect(() => setPreviewSource(null), [source]);
        const initialMode = IMAGE_LOAD_MODE.ORIGINAL;

        const [loadState, setLoadState] = React.useState<LoadState>({ src, mode: initialMode });
        const mode = loadState.src === src ? loadState.mode : initialMode;

        React.useEffect(() => {
            setLoadState({ src, mode: initialMode });
        }, [src, initialMode]);

        const handleError = (event: React.SyntheticEvent<HTMLImageElement, Event>) => {
            const nextMode = IMAGE_LOAD_MODE.FALLBACK;
            setLoadState({ src, mode: nextMode });
            onError?.(event);
        };

        const currentClassName = preview && preview.sourceClassName === originalClassName ? preview.className : originalClassName;

        const imageProps = {
            ...props,
            className: currentClassName,
            onError: handleError,
        };

        if (!src) {
            return <img ref={ref} src={FALLBACK_IMAGE_URL} {...imageProps} data-empty-image="" />;
        }

        const isErrorMode = mode === IMAGE_LOAD_MODE.FALLBACK;
        const imageSrc = isErrorMode ? FALLBACK_IMAGE_URL : src;
        const srcSet = isErrorMode ? undefined : buildSrcSet(src, quality);
        return (
            <img
                ref={ref}
                src={imageSrc}
                srcSet={srcSet}
                sizes={srcSet ? (sizes ?? "100vw") : undefined}
                width={props.width ?? originWidth}
                height={props.height ?? originHeight}
                decoding="async"
                {...imageProps}
                data-error-image={isErrorMode ? "" : undefined}
            />
        );
    }
);

Image.displayName = "Image";

export { Image };
