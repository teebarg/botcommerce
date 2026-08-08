import { useCallback } from "react";
import { useDropzone, type FileRejection } from "react-dropzone";
import { ImagePlus } from "lucide-react";
import { baseURL } from "@/utils/api";
import { toast } from "sonner";

interface ProductImageUploaderProps {
    productId?: number;
    onComplete?: () => void;
    maxFiles?: number;
    maxSizeMb?: number;
}

export function ProductImageUploader({
    productId,
    onComplete,
    maxFiles = 5,
    maxSizeMb = 5,
}: ProductImageUploaderProps) {

    const uploadFiles = useCallback(
        async (files: File[]) => {
            if (files.length === 0) return;

            const formData = new FormData();
            files.forEach((file) => formData.append("files", file));

            const uploadUrl = productId
                ? `${baseURL}/api/product/${productId}/images`
                : `${baseURL}/api/gallery/bulk-upload-images`;

            const toastId = toast.loading(
                files.length > 1 ? `Uploading ${files.length} images...` : "Uploading image..."
            );

            try {
                const res = await fetch(uploadUrl, {
                    method: "POST",
                    body: formData,
                });

                if (!res.ok) {
                    const body = await res.json().catch(() => null);
                    throw new Error(body?.detail ?? "Upload failed");
                }

                toast.success(
                    files.length > 1 ? "Images uploaded successfully" : "Image uploaded successfully",
                    { id: toastId }
                );
                onComplete?.();
            } catch (err) {
                toast.error("An error occurred", {
                    id: toastId,
                    description: err instanceof Error ? err.message : "Upload failed",
                });
            }
        },
        [productId, onComplete]
    );

    const onDrop = useCallback(
        (acceptedFiles: File[], fileRejections: FileRejection[]) => {
            const accepted = acceptedFiles.slice(0, Math.max(maxFiles, 0));

            fileRejections.forEach(({ file, errors }) => {
                const message =
                    errors[0]?.code === "file-too-large"
                        ? `Too large. Max ${maxSizeMb}MB.`
                        : errors[0]?.code === "file-invalid-type"
                            ? "Unsupported format. Use JPG, PNG, WEBP, or GIF."
                            : errors[0]?.message ?? "Rejected";
                toast.error(`${file.name}: ${message}`);
            });

            uploadFiles(accepted);
        },
        [maxFiles, maxSizeMb, uploadFiles]
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