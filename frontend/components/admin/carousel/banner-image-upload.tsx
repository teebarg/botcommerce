"use client";

import React, { useState } from "react";
import { useDropzone } from "react-dropzone";
import { Upload } from "lucide-react";
import { toast } from "sonner";

import { useInvalidate } from "@/lib/hooks/useApi";
import { api } from "@/apis";

interface BannerImageManagerProps {
    bannerId: number;
    onClose?: () => void;
}

const BannerImageManager: React.FC<BannerImageManagerProps> = ({ bannerId, onClose }) => {
    const [isUploading, setIsUploading] = useState<boolean>(false);
    const invalidate = useInvalidate();

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
                    try {
                        setIsUploading(true);
                        const { error } = await api.admin.carousel.uploadImage(bannerId, {
                            file: base64.split(",")[1]!,
                            file_name: fileName,
                            content_type: file.type,
                        });

                        if (error) {
                            toast.error(error);

                            return;
                        }

                        invalidate("carousel-banners");
                        toast.success("Image uploaded successfully");
                        onClose?.();
                    } catch (error) {
                        toast.error(`Error - ${error as string}`);
                    } finally {
                        setIsUploading(false);
                    }
                })();
            };
            reader.readAsDataURL(file);
        },
    });

    return (
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
                {isUploading && (
                    <div className="mb-4">
                        <div className="w-full bg-default-200 rounded-full h-2.5">
                            <div className="bg-blue-600 h-2.5 rounded-full transition-all duration-300" style={{ width: `${52}%` }} />
                        </div>
                        <p className="text-sm text-blue-500 mt-1">Uploading...</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default BannerImageManager;
