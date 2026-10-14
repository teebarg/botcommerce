import * as React from "react";
import { baseURL } from "@/utils/api";

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

const FALLBACK_IMAGE_URL = `${baseURL}/placeholder.jpg`;

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
            // Renders as a real <img> (not a <div>) — the visual editor's
            // click-to-edit toolbar keys its "Replace Image" action off the DOM
            // tag being `img`, so a placeholder div would be unrecoverable in the
            // editor. FALLBACK_IMAGE_URL doubles as the "no image chosen" graphic.
            return <img ref={ref} src={FALLBACK_IMAGE_URL} {...imageProps} data-empty-image="" />;
        }

        const isErrorMode = mode === IMAGE_LOAD_MODE.FALLBACK;
        const imageSrc = isErrorMode ? FALLBACK_IMAGE_URL : src;
        return <img ref={ref} src={imageSrc} {...imageProps} data-error-image={isErrorMode ? "" : undefined} />;
    }
);

Image.displayName = "Image";

export { Image };
