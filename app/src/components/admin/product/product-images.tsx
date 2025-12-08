import type React from "react";
import { useDropzone } from "react-dropzone";
import { Upload } from "lucide-react";

import DraggableImageList from "./draggable-images";
import type { ProductImage } from "@/schemas";
import { useUploadImages } from "@/hooks/useProduct";

interface ProductImageManagerProps {
    productId: number;
    initialImages?: ProductImage[];
}

const ProductImagesManager: React.FC<ProductImageManagerProps> = ({ productId, initialImages = [] }) => {
    const uploadImages = useUploadImages();

    const { getRootProps, getInputProps, isDragActive } = useDropzone({
        accept: {
            "image/*": [".jpeg", ".jpg", ".png", ".gif"],
        },
        maxSize: 5 * 1024 * 1024, // 5MB
        onDrop: (acceptedFiles: File[]) => {
            for (const file of acceptedFiles) {
                const reader = new FileReader();

                reader.onload = (e) => {
                    const base64 = reader.result as string;
                    const fileName = `images/${Date.now()}-${file.name}`;

                    void (async () => {
                        uploadImages.mutate({
                            id: productId,
                            data: {
                                file: base64.split(",")[1]!,
                                file_name: fileName,
                                content_type: file.type,
                            },
                        });
                    })();
                };
                reader.readAsDataURL(file);
            }
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
                    <Upload className="w-8 h-8 text-muted-foreground" />
                    <p className="text-foreground">{isDragActive ? "Drop the images here" : "Drag & drop images or click to upload"}</p>
                    <p className="text-sm text-muted-foreground">(Max 5MB, JPG/PNG/GIF only)</p>
                    {uploadImages.isPending && (
                        <div className="mb-4">
                            <div className="w-full bg-border rounded-full h-2.5">
                                <div className="bg-blue-600 h-2.5 rounded-full transition-all duration-300" style={{ width: `${52}%` }} />
                            </div>
                            <p className="text-sm text-blue-500 mt-1">Uploading...</p>
                        </div>
                    )}
                </div>
            </div>

            <DraggableImageList initialImages={initialImages} productId={productId} />

            {initialImages.length === 0 && <p className="text-center text-muted-foreground">No images uploaded yet</p>}

            <div className="text-xs text-muted-foreground">
                <p>• Drag and drop images to reorder them</p>
                <p>• The primary image will be displayed first in the product listing</p>
                <p>• Recommended image size: 1000 x 1000 pixels</p>
            </div>
        </div>
    );
};

export default ProductImagesManager;
