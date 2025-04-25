"use client";

import { useState } from "react";
import { Upload, X, Camera } from "lucide-react";

import { Input } from "@/components/ui/input";
import { useIsMobile } from "@/lib/hooks/use-mobile";

interface ProductImageUploadProps {
    images: string[];
    onImagesChange: (urls: string[]) => void;
    maxImages?: number;
}

const ProductImageUpload = ({ images, onImagesChange, maxImages = 6 }: ProductImageUploadProps) => {
    const isMobile = useIsMobile();
    const [dragActive, setDragActive] = useState(false);

    const handleDrag = (e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
        if (e.type === "dragenter" || e.type === "dragover") {
            setDragActive(true);
        } else if (e.type === "dragleave") {
            setDragActive(false);
        }
    };

    const handleDrop = (e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
        setDragActive(false);

        if (e.dataTransfer.files && e.dataTransfer.files.length > 0 && images.length < maxImages) {
            handleFiles(e.dataTransfer.files);
        }
    };

    const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files.length > 0 && images.length < maxImages) {
            handleFiles(e.target.files);
        }
    };

    const handleFiles = (files: FileList) => {
        const newImages = [...images];
        const remainingSlots = maxImages - images.length;

        // In a real app, you would upload these to your server or cloud storage
        // and get back URLs. For this demo, we'll create object URLs.
        Array.from(files)
            .slice(0, remainingSlots)
            .forEach((file) => {
                const imageUrl = URL.createObjectURL(file);

                newImages.push(imageUrl);
            });

        onImagesChange(newImages);
    };

    const removeImage = (index: number) => {
        const newImages = [...images];

        newImages.splice(index, 1);
        onImagesChange(newImages);
    };

    const openCamera = () => {
        // In a real app, this would use the camera API
        console.log("Open camera");
        const fileInput = document.getElementById("product-image-upload");

        if (fileInput) {
            fileInput.click();
        }
    };

    return (
        <div className="space-y-3">
            <label className="text-sm font-medium text-default-900">Product Images</label>

            <div className="grid grid-cols-3 gap-2">
                {images.map((image, index) => (
                    <div key={index} className="relative aspect-square rounded-md overflow-hidden border border-gray-200 bg-gray-50">
                        <img alt={`Product ${index + 1}`} className="w-full h-full object-cover" src={image} />
                        <button className="absolute top-1 right-1 bg-content1 rounded-full p-1 shadow-sm" onClick={() => removeImage(index)}>
                            <X className="text-default-500" size={14} />
                        </button>
                    </div>
                ))}

                {images.length < maxImages && (
                    <div
                        className={`aspect-square rounded-md border-2 border-dashed flex flex-col items-center justify-center gap-1 transition-colors cursor-pointer ${
                            dragActive ? "border-primary bg-primary/5" : "border-gray-300 bg-gray-50 hover:bg-gray-100"
                        }`}
                        onClick={() => document.getElementById("product-image-upload")?.click()}
                        onDragEnter={handleDrag}
                        onDragLeave={handleDrag}
                        onDragOver={handleDrag}
                        onDrop={handleDrop}
                    >
                        <Upload className="text-gray-500" size={20} />
                        <span className="text-xs text-gray-500">Upload</span>
                        <Input multiple accept="image/*" className="hidden" id="product-image-upload" type="file" onChange={handleFileInput} />
                    </div>
                )}

                {isMobile && images.length < maxImages && (
                    <div
                        className="aspect-square rounded-md border-2 border-dashed flex flex-col items-center justify-center gap-1 cursor-pointer border-gray-300 bg-gray-50 hover:bg-gray-100"
                        onClick={openCamera}
                    >
                        <Camera className="text-gray-500" size={20} />
                        <span className="text-xs text-gray-500">Camera</span>
                    </div>
                )}
            </div>

            <p className="text-xs text-default-500">
                {images.length} of {maxImages} images. JPG, PNG or GIF, max 5MB each.
            </p>
        </div>
    );
};

export default ProductImageUpload;
