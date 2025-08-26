"use client";

import React, { useState } from "react";
import { X, Edit, Star, StarOff, Move, Check } from "lucide-react";
import { DragDropContext, Droppable, Draggable } from "@hello-pangea/dnd";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ProductImageFile } from "@/types/product-image";

interface ImagePreviewGridProps {
    images: ProductImageFile[];
    onRemoveImage: (imageId: string) => void;
    onEditImage: (imageId: string) => void;
    onReorderImages: (images: ProductImageFile[]) => void;
    onTogglePrimary: (imageId: string) => void;
    onSelectImages: (imageIds: string[]) => void;
    selectedImages: string[];
    isEditing?: boolean;
}

const ImagePreviewGrid: React.FC<ImagePreviewGridProps> = ({
    images,
    onRemoveImage,
    onEditImage,
    onReorderImages,
    onTogglePrimary,
    onSelectImages,
    selectedImages,
    isEditing = false,
}) => {
    const [isDragging, setIsDragging] = useState(false);

    const handleDragEnd = (result: any) => {
        setIsDragging(false);

        if (!result.destination) return;

        const items = Array.from(images);
        const [reorderedItem] = items.splice(result.source.index, 1);

        items.splice(result.destination.index, 0, reorderedItem);

        onReorderImages(items);
    };

    const handleImageSelect = (imageId: string) => {
        if (selectedImages.includes(imageId)) {
            onSelectImages(selectedImages.filter((id) => id !== imageId));
        } else {
            onSelectImages([...selectedImages, imageId]);
        }
    };

    const handleSelectAll = () => {
        if (selectedImages.length === images.length) {
            onSelectImages([]);
        } else {
            onSelectImages(images.map((img) => img.id));
        }
    };

    if (images?.length === 0) {
        return (
            <div className="text-center py-8 text-gray-500">
                <p>No images selected yet</p>
                <p className="text-sm">Add images to get started</p>
            </div>
        );
    }

    return (
        <div className="space-y-4">
            {/* Selection Controls */}
            {isEditing && images?.length > 0 && (
                <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-center gap-2">
                        <Button size="sm" type="button" variant="outline" onClick={handleSelectAll}>
                            {selectedImages.length === images.length ? (
                                <>
                                    <X className="w-4 h-4 mr-1" />
                                    Deselect All
                                </>
                            ) : (
                                <>
                                    <Check className="w-4 h-4 mr-1" />
                                    Select All
                                </>
                            )}
                        </Button>
                        {selectedImages.length > 0 && <Badge variant="secondary">{selectedImages.length} selected</Badge>}
                    </div>
                </div>
            )}

            {/* Image Grid */}
            <DragDropContext onDragEnd={handleDragEnd} onDragStart={() => setIsDragging(true)}>
                <Droppable direction="horizontal" droppableId="images">
                    {(provided) => (
                        <div
                            ref={provided.innerRef}
                            {...provided.droppableProps}
                            className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4"
                        >
                            {images?.map((image, index) => (
                                <Draggable key={image.id} draggableId={image.id} index={index}>
                                    {(provided, snapshot) => (
                                        <div
                                            ref={provided.innerRef}
                                            {...provided.draggableProps}
                                            className={`
                                                relative group aspect-square rounded-lg overflow-hidden border-2
                                                ${snapshot.isDragging ? "scale-105 shadow-lg z-10" : ""}
                                                ${selectedImages.includes(image.id) ? "border-blue-500" : "border-gray-200"}
                                                ${isDragging ? "cursor-grabbing" : "cursor-grab"}
                                            `}
                                        >
                                            {/* Image */}
                                            <img
                                                alt={image.metadata.name || "Product image"}
                                                className="w-full h-full object-cover"
                                                src={image.preview}
                                            />

                                            {/* Overlay */}
                                            <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-30 transition-all duration-200">
                                                {/* Primary Badge */}
                                                {image.metadata.isPrimary && (
                                                    <div className="absolute top-2 left-2">
                                                        <Badge className="bg-yellow-500 text-white" variant="default">
                                                            <Star className="w-3 h-3 mr-1" />
                                                            Primary
                                                        </Badge>
                                                    </div>
                                                )}

                                                {/* Upload Status */}
                                                {image.uploadStatus !== "pending" && (
                                                    <div className="absolute top-2 right-2">
                                                        <Badge
                                                            variant={
                                                                image.uploadStatus === "success"
                                                                    ? "default"
                                                                    : image.uploadStatus === "error"
                                                                      ? "destructive"
                                                                      : "secondary"
                                                            }
                                                        >
                                                            {image.uploadStatus === "uploading" && "Uploading..."}
                                                            {image.uploadStatus === "success" && "✓"}
                                                            {image.uploadStatus === "error" && "✗"}
                                                        </Badge>
                                                    </div>
                                                )}

                                                {/* Action Buttons */}
                                                <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                                                    <div className="flex gap-2">
                                                        {isEditing && (
                                                            <>
                                                                <Button
                                                                    className="bg-white/90 hover:bg-white"
                                                                    size="sm"
                                                                    type="button"
                                                                    variant="secondary"
                                                                    onClick={() => handleImageSelect(image.id)}
                                                                >
                                                                    {selectedImages.includes(image.id) ? (
                                                                        <Check className="w-4 h-4" />
                                                                    ) : (
                                                                        <Check className="w-4 h-4" />
                                                                    )}
                                                                </Button>

                                                                <Button
                                                                    className="bg-white/90 hover:bg-white"
                                                                    size="sm"
                                                                    type="button"
                                                                    variant="secondary"
                                                                    onClick={() => onEditImage(image.id)}
                                                                >
                                                                    <Edit className="w-4 h-4" />
                                                                </Button>
                                                            </>
                                                        )}

                                                        <Button
                                                            className="bg-white/90 hover:bg-white"
                                                            size="sm"
                                                            type="button"
                                                            variant="secondary"
                                                            onClick={() => onTogglePrimary(image.id)}
                                                        >
                                                            {image.metadata.isPrimary ? (
                                                                <StarOff className="w-4 h-4" />
                                                            ) : (
                                                                <Star className="w-4 h-4" />
                                                            )}
                                                        </Button>

                                                        <Button
                                                            className="bg-red-500/90 hover:bg-red-500 text-white"
                                                            size="sm"
                                                            type="button"
                                                            variant="destructive"
                                                            onClick={() => onRemoveImage(image.id)}
                                                        >
                                                            <X className="w-4 h-4" />
                                                        </Button>
                                                    </div>
                                                </div>

                                                {/* Drag Handle */}
                                                <div
                                                    {...provided.dragHandleProps}
                                                    className="absolute bottom-2 left-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200"
                                                >
                                                    <div className="p-1 bg-white/90 rounded cursor-grab">
                                                        <Move className="w-3 h-3 text-gray-600" />
                                                    </div>
                                                </div>
                                            </div>

                                            {/* Image Name */}
                                            <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent p-2">
                                                <p className="text-white text-xs truncate">{image.metadata.name || image.file.name}</p>
                                            </div>

                                            {/* Progress Bar */}
                                            {image.uploadStatus === "uploading" && (
                                                <div className="absolute bottom-0 left-0 right-0 h-1 bg-gray-200">
                                                    <div
                                                        className="h-full bg-blue-500 transition-all duration-300"
                                                        style={{ width: `${image.uploadProgress}%` }}
                                                    />
                                                </div>
                                            )}
                                        </div>
                                    )}
                                </Draggable>
                            ))}
                            {provided.placeholder}
                        </div>
                    )}
                </Droppable>
            </DragDropContext>

            {/* Image Count */}
            <div className="text-sm text-gray-500 text-center">
                {images?.length} image{images?.length !== 1 ? "s" : ""} selected
            </div>
        </div>
    );
};

export default ImagePreviewGrid;
