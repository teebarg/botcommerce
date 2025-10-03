import type { ProductImage } from "./product-creator";

import { useState, useRef } from "react";
import { Upload, X, Image as ImageIcon, Plus } from "lucide-react";

import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface ImageUploadProps {
    images: ProductImage[];
    onImagesChange: (images: ProductImage[]) => void;
    isLoading?: boolean;
    showUploadArea?: boolean;
}

export function ImageUpload({ images, onImagesChange, isLoading = false, showUploadArea = true }: ImageUploadProps) {
    const [isDragOver, setIsDragOver] = useState<boolean>(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleDragOver = (e: React.DragEvent) => {
        e.preventDefault();
        setIsDragOver(true);
    };

    const handleDragLeave = (e: React.DragEvent) => {
        e.preventDefault();
        setIsDragOver(false);
    };

    const handleDrop = (e: React.DragEvent) => {
        e.preventDefault();
        setIsDragOver(false);
        const files = Array.from(e.dataTransfer.files);

        handleFiles(files);
    };

    const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = Array.from(e.target.files || []);

        handleFiles(files);
    };

    const handleFiles = (files: File[]) => {
        const imageFiles = files.filter((file) => file.type.startsWith("image/"));
        const newImages: ProductImage[] = imageFiles.map((file) => ({
            id: Math.random().toString(36).substr(2, 9),
            file,
            url: URL.createObjectURL(file),
        }));

        onImagesChange([...images, ...newImages]);
    };

    const removeImage = (imageId: string) => {
        const imageToRemove = images.find((img) => img.id === imageId);

        if (imageToRemove) {
            URL.revokeObjectURL(imageToRemove.url);
        }
        onImagesChange(images.filter((img) => img.id !== imageId));
    };

    const openFileDialog = () => {
        fileInputRef.current?.click();
    };

    return (
        <div className="space-y-6">
            <Card
                className={cn(
                    "border-2 border-dashed transition-all duration-smooth cursor-pointer hover:border-primary/50",
                    isDragOver ? "border-primary bg-accent/50 scale-[1.02]" : "border-border"
                )}
                onClick={isLoading ? undefined : openFileDialog}
                onDragLeave={handleDragLeave}
                onDragOver={handleDragOver}
                onDrop={isLoading ? undefined : handleDrop}
            >
                <div className="px-8 py-4 text-center">
                    <div className="flex justify-center mb-4">
                        <div className="w-12 h-12 bg-accent rounded-full flex items-center justify-center">
                            <Upload className="w-6 h-6 text-white" />
                        </div>
                    </div>
                    <h3 className="text-lg font-medium text-card-foreground">Drop your images here</h3>
                    <p className="text-muted-foreground mb-4">or click to browse your files</p>
                    <Button className="pointer-events-none" size="sm" variant="outline">
                        <ImageIcon className="w-4 h-4 mr-2" />
                        Choose Images
                    </Button>
                    <p className="text-xs text-muted-foreground mt-2">Supports JPG, PNG, WebP up to 5MB each</p>
                    {isLoading && (
                        <div className="mb-4 mt-2">
                            <div className="w-full bg-border rounded-full h-2.5">
                                <div
                                    className="bg-blue-500 h-2.5 rounded-full transition-all duration-200 animate-pulse"
                                    style={{ width: `${52}%` }}
                                />
                            </div>
                            <p className="text-sm text-blue-500 mt-1">Uploading...</p>
                        </div>
                    )}
                </div>
            </Card>

            <input ref={fileInputRef} multiple accept="image/*" className="hidden" disabled={isLoading} type="file" onChange={handleFileSelect} />
            <div className={cn(!showUploadArea && "hidden")}>
                {images.length > 0 && (
                    <div>
                        <h3 className="text-lg font-medium mb-4 text-card-foreground">Uploaded Images ({images.length})</h3>
                        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
                            {images.map((image: ProductImage, idx: number) => (
                                <Card key={idx} className="relative group overflow-hidden bg-card shadow-sm">
                                    <div className="aspect-square">
                                        <img
                                            alt={`Product image ${idx + 1}`}
                                            className="w-full h-full object-cover transition-transform duration-smooth group-hover:scale-105"
                                            src={image.url}
                                        />
                                    </div>
                                    {idx === 0 && (
                                        <div className="absolute top-2 left-2 bg-gradient-primary text-white px-2 py-1 rounded-md text-xs font-medium">
                                            Main
                                        </div>
                                    )}
                                    <button
                                        className="absolute top-2 right-2 w-6 h-6 bg-destructive text-destructive-foreground rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-smooth hover:bg-destructive/90"
                                        onClick={(e) => {
                                            e.preventDefault();
                                            removeImage(image.id);
                                        }}
                                    >
                                        <X className="w-4 h-4" />
                                    </button>
                                </Card>
                            ))}

                            <Card
                                className="relative group overflow-hidden bg-gradient-card shadow-sm border-2 border-dashed border-border hover:border-primary/50 transition-colors duration-smooth cursor-pointer"
                                onClick={openFileDialog}
                            >
                                <div className="aspect-square flex items-center justify-center">
                                    <div className="text-center">
                                        <div className="w-8 h-8 bg-muted rounded-full flex items-center justify-center mx-auto mb-2 group-hover:bg-primary group-hover:text-white transition-colors duration-smooth">
                                            <Plus className="w-4 h-4" />
                                        </div>
                                        <p className="text-sm text-muted-foreground">Add More</p>
                                    </div>
                                </div>
                            </Card>
                        </div>
                    </div>
                )}

                {images.length === 0 && (
                    <div className="text-center py-8">
                        <p className="text-muted-foreground">No images uploaded yet</p>
                    </div>
                )}
            </div>
        </div>
    );
}
