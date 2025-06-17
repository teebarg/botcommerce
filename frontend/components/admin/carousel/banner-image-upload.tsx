"use client";

import React, { useState } from "react";
import { useDropzone } from "react-dropzone";
import { Upload } from "lucide-react";
import { toast } from "sonner";

import { useInvalidate } from "@/lib/hooks/useApi";
import { api } from "@/apis";

interface BannerImageManagerProps {
    bannerId: number;
    initialImage?: string;
}

const BannerImageManager: React.FC<BannerImageManagerProps> = ({ bannerId, initialImage = "" }) => {
    const [isDeleting, setIsDeleting] = useState<boolean>(false);
    const [isUploading] = useState<boolean>(false);
    const invalidate = useInvalidate();

    const deleteImage = () => {
        setIsDeleting(true);
        void (async () => {
            try {
                const { error } = await api.admin.carousel.deleteImage(bannerId);

                if (error) {
                    toast.error(error);

                    return;
                }

                toast.success("Image deleted successfully");
                invalidate("carousel-banners");
            } catch (error) {
                toast.error(`Error - ${error as string}`);
            } finally {
                setIsDeleting(false);
            }
        })();
    };

    // Dropzone configuration
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
                        const { error } = await api.admin.carousel.uploadImage(bannerId, {
                            file: base64.split(",")[1]!,
                            file_name: fileName,
                            content_type: file.type,
                        });

                        if (error) {
                            toast.error(error);

                            return;
                        }

                        toast.success("Image uploaded successfully");
                        invalidate("carousel-banners");
                    } catch (error) {
                        toast.error(`Error - ${error as string}`);
                    }
                })();
            };
            reader.readAsDataURL(file);
        },
    });

    return (
        <div className="space-y-6">
            {/* Upload Area */}
            <div
                {...getRootProps()}
                className={`border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition-colors
                    ${isDragActive ? "border-blue-500 bg-blue-50" : "border-gray-300 hover:border-gray-400"}`}
            >
                <input {...getInputProps()} />
                <div className="flex flex-col items-center gap-2">
                    <Upload className="w-8 h-8 text-default-500" />
                    <p className="text-default-600">{isDragActive ? "Drop the images here" : "Drag & drop images or click to upload"}</p>
                    <p className="text-sm text-default-400">(Max 5MB, JPG/PNG/GIF only)</p>
                    {/* Upload progress */}
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

            {/* Image */}
            {/* {initialImage && (
                <div className="relative group rounded-lg overflow-hidden shadow-md hover:shadow-lg transition-shadow">
                    <img alt={`Category image`} className="w-full h-48 object-cover" src={initialImage} />
                    <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-30 transition-all flex items-center justify-center">
                        <button
                            className="bg-red-500 text-white p-2 rounded-full opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-600"
                            onClick={deleteImage}
                        >
                            <Trash2 className="w-5 h-5" />
                        </button>
                    </div>
                    {isDeleting && (
                        <div className="absolute inset-0 bg-default-500 bg-opacity-50 flex items-center justify-center">
                            <span className="text-white">Deleting...</span>
                        </div>
                    )}
                </div>
            )} */}

            {/* {!initialImage && <p className="text-center text-default-500">No images uploaded yet</p>} */}

            {/* <div className="text-xs text-default-500">
                <p>• Recommended image size: 1000 x 1000 pixels</p>
            </div> */}
        </div>
    );
};

export default BannerImageManager;
