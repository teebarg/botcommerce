import React, { useState } from "react";
import { useDropzone } from "react-dropzone";
import { Upload } from "lucide-react";
import { toast } from "sonner";

import DraggableImageList from "./draggable-images";

import { ProductImage } from "@/types/models";
import { api } from "@/apis";
import { useInvalidate } from "@/lib/hooks/useApi";
import ImageReorder from "@/components/generic/sortable-images";

interface ProductImageManagerProps {
    productId: number;
    initialImages?: ProductImage[];
}

const ProductImagesManager: React.FC<ProductImageManagerProps> = ({ productId, initialImages = [] }) => {
    const invalidate = useInvalidate();
    const [isUploading, setIsUploading] = useState<boolean>(false);

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
                    setIsUploading(true);
                    const { error } = await api.product.uploadImages({
                        id: productId,
                        data: {
                            file: base64.split(",")[1]!, // Remove the data URL prefix
                            file_name: fileName,
                            content_type: file.type,
                        },
                    });

                    if (error) {
                        toast.error(`Error - ${error}`);
                        setIsUploading(false);

                        return;
                    }

                    toast.success("Image uploaded successfully");
                    invalidate("products");
                    invalidate("product-search");
                    setIsUploading(false);
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

            <ImageReorder initialImages={initialImages} productId={productId} />

            <DraggableImageList initialImages={initialImages} productId={productId} />

            {initialImages.length === 0 && <p className="text-center text-default-500">No images uploaded yet</p>}

            {/* Help text */}
            <div className="text-xs text-default-500">
                <p>• Drag and drop images to reorder them</p>
                <p>• The primary image will be displayed first in the product listing</p>
                <p>• Recommended image size: 1000 x 1000 pixels</p>
            </div>
        </div>
    );
};

export default ProductImagesManager;
