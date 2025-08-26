"use client";

import React, { useCallback, useRef, useState } from "react";
import { useDropzone } from "react-dropzone";
import { Camera, Upload, Image as ImageIcon } from "lucide-react";

import { Button } from "@/components/ui/button";
import { ProductImageFile, createProductImageFile } from "@/types/product-image";

interface ImageSelectorProps {
    onImagesSelected: (images: ProductImageFile[]) => void;
    maxImages?: number;
    acceptedFileTypes?: string[];
    maxFileSize?: number;
}

const ImageSelector: React.FC<ImageSelectorProps> = ({
    onImagesSelected,
    maxImages = 10,
    acceptedFileTypes = ["image/jpeg", "image/png", "image/webp", "image/heic"],
    maxFileSize = 10 * 1024 * 1024, // 10MB
}) => {
    const [isCapturing, setIsCapturing] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const cameraInputRef = useRef<HTMLInputElement>(null);

    const onDrop = useCallback(
        (acceptedFiles: File[]) => {
            const imageFiles = acceptedFiles
                .filter((file) => acceptedFileTypes.includes(file.type))
                .filter((file) => file.size <= maxFileSize)
                .slice(0, maxImages)
                .map((file) => createProductImageFile(file));

            onImagesSelected(imageFiles);
        },
        [acceptedFileTypes, maxFileSize, maxImages, onImagesSelected]
    );

    const { getRootProps, getInputProps, isDragActive } = useDropzone({
        onDrop,
        accept: {
            "image/*": acceptedFileTypes,
        },
        maxSize: maxFileSize,
        multiple: true,
    });

    const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
        const files = Array.from(event.target.files || []);

        onDrop(files);
        // Reset input value to allow selecting the same file again
        event.target.value = "";
    };

    const handleCameraCapture = (event: React.ChangeEvent<HTMLInputElement>) => {
        const files = Array.from(event.target.files || []);

        onDrop(files);
        setIsCapturing(false);
        // Reset input value
        event.target.value = "";
    };

    const openCamera = () => {
        setIsCapturing(true);
        cameraInputRef.current?.click();
    };

    const openGallery = () => {
        fileInputRef.current?.click();
    };

    return (
        <div className="space-y-4">
            {/* Dropzone */}
            <div
                {...getRootProps()}
                className={`
                    border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition-all duration-200
                    ${isDragActive ? "border-blue-500 bg-blue-50 scale-105" : "border-gray-300 hover:border-gray-400 hover:bg-gray-50"}
                `}
            >
                <input {...getInputProps()} />
                <div className="flex flex-col items-center gap-3">
                    <div className="p-3 bg-blue-100 rounded-full">
                        <Upload className="w-6 h-6 text-blue-600" />
                    </div>
                    <div className="space-y-1">
                        <p className="text-lg font-medium text-gray-900">{isDragActive ? "Drop images here" : "Upload product images"}</p>
                        <p className="text-sm text-gray-500">Drag & drop images or click to browse</p>
                    </div>
                    <div className="text-xs text-gray-400">
                        <p>Supports: JPEG, PNG, WebP, HEIC • Max: {Math.round(maxFileSize / 1024 / 1024)}MB per file</p>
                        <p>Maximum {maxImages} images</p>
                    </div>
                </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-3">
                <Button className="flex-1 sm:flex-none" type="button" variant="outline" onClick={openGallery}>
                    <ImageIcon className="w-4 h-4 mr-2" />
                    Choose from Gallery
                </Button>

                <Button className="flex-1 sm:flex-none" disabled={isCapturing} type="button" variant="outline" onClick={openCamera}>
                    <Camera className="w-4 h-4 mr-2" />
                    {isCapturing ? "Capturing..." : "Take Photo"}
                </Button>
            </div>

            {/* Hidden file inputs */}
            <input ref={fileInputRef} multiple accept="image/*" className="hidden" type="file" onChange={handleFileSelect} />

            <input ref={cameraInputRef} accept="image/*" capture="environment" className="hidden" type="file" onChange={handleCameraCapture} />

            {/* Mobile-friendly bottom sheet trigger */}
            <div className="sm:hidden">
                <Button
                    className="w-full"
                    type="button"
                    variant="default"
                    onClick={() => {
                        // Show mobile action sheet
                        const action = window.confirm("Choose action:\nOK = Camera\nCancel = Gallery");

                        if (action) {
                            openCamera();
                        } else {
                            openGallery();
                        }
                    }}
                >
                    <Upload className="w-4 h-4 mr-2" />
                    Add Images
                </Button>
            </div>
        </div>
    );
};

export default ImageSelector;
