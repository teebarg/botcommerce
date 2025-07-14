"use client";

import React, { useState } from "react";
import { useDropzone } from "react-dropzone";
import { Trash2, Upload } from "lucide-react";
import { toast } from "sonner";

import { useInvalidate } from "@/lib/hooks/useApi";
import { api } from "@/apis/client";
import { Button } from "@/components/ui/button";
import { Message } from "@/schemas";
import { tryCatch } from "@/lib/try-catch";
import Image from "next/image";

interface ProductImageManagerProps {
    categoryId: number;
    initialImage?: string;
    onClose?: () => void;
}

const CategoryImageManager: React.FC<ProductImageManagerProps> = ({ categoryId, initialImage = "", onClose }) => {
    const [isDeleting, setIsDeleting] = useState<boolean>(false);
    const invalidate = useInvalidate();

    const deleteImage = () => {
        setIsDeleting(true);
        void (async () => {
            try {
                const { error } = await tryCatch<Message>(api.delete(`/category/${categoryId}/image`));

                if (error) {
                    toast.error(error);

                    return;
                }

                toast.success("Image deleted successfully");
                invalidate("categories");
                onClose?.();
            } catch (error) {
                toast.error(`Error - ${error as string}`);
            } finally {
                setIsDeleting(false);
            }
        })();
    };

    const { getRootProps, getInputProps, isDragActive } = useDropzone({
        accept: {
            "image/*": [".jpeg", ".jpg", ".png", ".gif"],
        },
        maxSize: 5 * 1024 * 1024, // 5MB
        onDrop: (acceptedFiles: File[]) => {
            const file = acceptedFiles[0];

            if (!file) return;

            const reader = new FileReader();

            reader.onload = (e) => {
                const base64 = reader.result as string;
                const fileName = `images/${Date.now()}-${file.name}`;

                void (async () => {
                    const toastId = toast.loading("Uploading image...");
                    try {
                        const { error } = await tryCatch<Message>(
                            api.patch(`/category/${categoryId}/image`, {
                                file: base64.split(",")[1]!, // Remove the data URL prefix
                                file_name: fileName,
                                content_type: file.type,
                            })
                        );

                        if (error) {
                            toast.error(error);

                            return;
                        }

                        toast.success("Image uploaded successfully", { id: toastId });
                        invalidate("categories");
                        onClose?.();
                    } catch (error) {
                        toast.error(`Error - ${error as string}`, { id: toastId });
                    }
                })();
            };
            reader.readAsDataURL(file);
        },
    });

    return (
        <div className="space-y-6">
            <div
                {...getRootProps()}
                className={`border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition-colors
                    ${isDragActive ? "border-blue-500 bg-blue-50" : "border-gray-300 hover:border-gray-400"}`}
            >
                <input {...getInputProps()} />
                <div className="flex flex-col items-center gap-2">
                    <Upload className="w-8 h-8 text-default-500" />
                    <p className="text-default-600">{isDragActive ? "Drop the image here" : "Drag & drop image or click to upload"}</p>
                    <p className="text-sm text-default-400">(Max 5MB, JPG/PNG/GIF only)</p>
                </div>
            </div>

            {initialImage && (
                <div className="relative group rounded-lg overflow-hidden shadow-md hover:shadow-lg transition-shadow">
                    <Image
                        src={initialImage || "/placeholder.jpg"}
                        alt="Category image"
                        fill
                        sizes="(max-width: 768px) 100vw, 33vw"
                        className="object-cover"
                        placeholder="blur"
                        blurDataURL="/placeholder.jpg"
                    />
                    <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-30 transition-all flex items-center justify-center">
                        <Button className="rounded-full" size="icon" variant="destructive" onClick={deleteImage}>
                            <Trash2 className="w-5 h-5" />
                        </Button>
                    </div>
                    {isDeleting && (
                        <div className="absolute inset-0 bg-default-500 bg-opacity-50 flex items-center justify-center">
                            <span className="text-white">Deleting...</span>
                        </div>
                    )}
                </div>
            )}

            {!initialImage && <p className="text-center text-default-500">No image uploaded yet</p>}

            <div className="text-xs text-default-500">
                <p>• Recommended image size: 1000 x 1000 pixels</p>
            </div>
        </div>
    );
};

export default CategoryImageManager;
