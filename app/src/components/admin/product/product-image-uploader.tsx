import { useCallback } from "react";
import { useDropzone, type FileRejection } from "react-dropzone";
import { ImagePlus } from "lucide-react";
import { baseURL } from "@/utils/api";
import { toast } from "sonner";

export interface ProductImage {
    id: number;
    image: string;
    order: number;
    product_id: number;
}

interface ProductImageUploaderProps {
    productId?: number;
    onComplete?: () => void;
    maxFiles?: number;
    maxSizeMb?: number;
}

interface PendingUpload {
    localId: string;
    file: File;
    previewUrl: string;
    progress: number;
    error?: string;
}

export function ProductImageUploader({
    productId,
    onComplete,
    maxFiles = 5,
    maxSizeMb = 5,
}: ProductImageUploaderProps) {

    const onDrop = useCallback(
        (acceptedFiles: File[], fileRejections: FileRejection[]) => {
            const accepted: PendingUpload[] = acceptedFiles
                .slice(0, Math.max(maxFiles, 0))
                .map((file) => ({
                    localId: crypto.randomUUID(),
                    file,
                    previewUrl: URL.createObjectURL(file),
                    progress: 0,
                }));

            const rejected: PendingUpload[] = fileRejections.map(({ file, errors }) => ({
                localId: crypto.randomUUID(),
                file,
                previewUrl: URL.createObjectURL(file),
                progress: 0,
                error:
                    errors[0]?.code === "file-too-large"
                        ? `Too large. Max ${maxSizeMb}MB.`
                        : errors[0]?.code === "file-invalid-type"
                            ? "Unsupported format. Use JPG, PNG, WEBP, or GIF."
                            : errors[0]?.message ?? "Rejected",
            }));
            accepted.forEach((p) => uploadFile(p));
            console.log(rejected)
        },
        [maxFiles, productId]
    );

    const { getRootProps, getInputProps, isDragActive } = useDropzone({
        onDrop,
        accept: {
            "image/jpeg": [],
            "image/png": [],
            "image/webp": [],
            "image/gif": [],
        },
        maxSize: maxSizeMb * 1024 * 1024,
        maxFiles: maxFiles,
        disabled: maxFiles <= 0,
        noClick: false,
    });

    const uploadFile = async (item: PendingUpload) => {
        const formData = new FormData();
        formData.append("files", item.file);
        const uploadUrl = productId ? `${baseURL}/api/product/${productId}/images` : `${baseURL}/api/gallery/bulk-upload-images`
        const toastId = toast.loading("Uploading Image...");
        try {
            const res = await fetch(uploadUrl, {
                method: "POST",
                body: formData,
            });

            if (!res.ok) {
                const body = await res.json().catch(() => null);
                throw new Error(body?.detail ?? "Upload failed");
            }
            toast.success("Images upload successfully", { id: toastId });
            URL.revokeObjectURL(item.previewUrl);
            onComplete?.()
        } catch (err) {
            toast.success("An error occurred", { id: toastId, description: err instanceof Error ? err.message : "Upload failed" });
        }
    };

    return (
        <div
            {...getRootProps()}
            className={`flex cursor-pointer flex-col items-center justify-center gap-2 rounded-xl border border-dashed px-4 py-8 text-center transition-colors ${isDragActive
                ? "border-foreground bg-card"
                : "border-border bg-card hover:border-foreground/40"
                }`}
        >
            <ImagePlus className="h-5 w-5 text-muted-foreground" />
            <div className="space-y-0.5">
                <p className="text-sm text-foreground">
                    Drop images here, or click to browse
                </p>
                <p className="text-xs text-muted-foreground">
                    JPG, PNG, WEBP, or GIF — up to {maxSizeMb}MB each, {maxFiles} remaining
                </p>
            </div>
            <input {...getInputProps()} />
        </div>
    );
}