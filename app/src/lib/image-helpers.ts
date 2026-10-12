const WIX_MEDIA_HOSTS: Record<string, string> = {
    "media.base44.com": "/images/public/",
    "static.wixstatic.com": "/media/",
};

export const DEFAULT_TRANSFORM_WIDTH = 1024;

// Using "as const" gives us exact type literals instead of generic strings
export const IMAGE_LOAD_MODE = {
    OPTIMIZED: "optimized",
    ORIGINAL: "original",
    FALLBACK: "fallback",
} as const;

export type ImageLoadMode = typeof IMAGE_LOAD_MODE[keyof typeof IMAGE_LOAD_MODE];

const DEVICE_PIXEL_RATIOS = [1, 2, 3];
const MAX_DIMENSION = 6000;

export interface ParsedWixMedia {
    baseUrl: string;
    filename: string;
}

export interface FocalPoint {
    x: number;
    y: number;
}

export interface TransformOptions {
    width: number;
    height?: number;
    crop: boolean;
    focalPoint?: FocalPoint;
    quality: number;
}

// --- Helper Functions ---

export function splitImageProps(props: Record<string, any>) {
    const wrapperProps: Record<string, any> = {};
    const imageProps: Record<string, any> = {};
    
    for (const [key, value] of Object.entries(props)) {
        if (key.startsWith("data-")) {
            wrapperProps[key] = value;
        } else {
            imageProps[key] = value;
        }
    }
    return { wrapperProps, imageProps };
}

export function getImagePreviewClassName(
    className: string | undefined, 
    currentClassName: string, 
    baselineClassName: string
): string {
    const sourceClasses = new Set((className || "").split(/\s+/));
    const baselineClasses = new Set(baselineClassName.split(/\s+/));
    
    return currentClassName
        .split(/\s+/)
        .filter((token) => !["inline-block", "relative"].includes(token) || !baselineClasses.has(token) || sourceClasses.has(token))
        .join(" ");
}

/** Returns transform metadata only for canonical public Wix image URLs. */
export function parseWixMediaUrl(src: string): ParsedWixMedia | null {
    try {
      const url = new URL(src)
      if (
        url.protocol !== "https:" ||
        url.username ||
        url.password ||
        (url.port && url.port !== "443")
      ) {
        return null
      }
  
      const pathPrefix = WIX_MEDIA_HOSTS[url.hostname]
      if (!pathPrefix) return null
  
      const transformed = url.pathname.match(/^(.*)\/v1\/(?:fill|fit)\/[^/]+\/[^/]+$/i)
      const basePath = transformed ? transformed[1] : url.pathname
      const filename = basePath.split("/").pop()
      if (
        !basePath.startsWith(pathPrefix) ||
        !filename ||
        !/\.[a-z0-9]+$/i.test(filename) ||
        /\.svg$/i.test(filename)
      ) {
        return null
      }
  
      return { baseUrl: `${url.origin}${basePath}`, filename }
    } catch {
      return null
    }
  }

const clampDim = (n: number): number => Math.min(Math.max(Math.round(n), 1), MAX_DIMENSION);
const clamp01 = (n: number): number => Math.min(1, Math.max(0, n));

export function buildTransformUrl(
    { baseUrl, filename }: ParsedWixMedia, 
    { width, height, crop, focalPoint, quality }: TransformOptions
): string {
    const params = [`w_${clampDim(width)}`, `h_${clampDim(height || width)}`];
    if (crop) {
        params.push(focalPoint ? `fp_${clamp01(focalPoint.x).toFixed(2)}_${clamp01(focalPoint.y).toFixed(2)}` : "al_c");
    }
    // Preserve GIF delivery; negotiate AVIF/WebP for other images via Accept.
    const encoding = /\.gif\$/i.test(filename) ? "enc_webp" : "enc_auto";
    params.push(`q_${quality}`, "usm_0.66_1.00_0.01", encoding, "quality_auto");
    return `${baseUrl}/v1/${crop ? "fill" : "fit"}/${params.join(",")}/${filename}`;
}

export function buildSrcSet(parsed: ParsedWixMedia, options: TransformOptions): string {
    return DEVICE_PIXEL_RATIOS.map(
        (dpr) =>
            `${buildTransformUrl(parsed, {
                ...options,
                width: options.width * dpr,
                height: options.height ? options.height * dpr : undefined,
            })} ${dpr}x`
    ).join(", ");
}

export function getOriginalImageUrl(src: string, parsed: ParsedWixMedia | null): string {
    return parsed?.baseUrl || src;
}

export function nextImageLoadMode(mode: ImageLoadMode): ImageLoadMode {
    return mode === IMAGE_LOAD_MODE.OPTIMIZED ? IMAGE_LOAD_MODE.ORIGINAL : IMAGE_LOAD_MODE.FALLBACK;
}
