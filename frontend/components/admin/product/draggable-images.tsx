"use client";

import React, { useState, useRef, useEffect } from "react";
import { Trash } from "lucide-react";

import { ProductImage } from "@/schemas";
import { Button } from "@/components/ui/button";
import { useDeleteImages, useReorderImages } from "@/lib/hooks/useProduct";

interface DraggableImageListProps {
    initialImages: ProductImage[];
    productId: number;
}

interface Position {
    x: number;
    y: number;
}

const DeleteButton: React.FC<{ image: ProductImage; productId: number }> = ({ image, productId }) => {
    const deleteImages = useDeleteImages();

    const handleDelete = async () => {
        deleteImages.mutate({ id: productId, imageId: image.id });
    };

    return (
        <Button
            className="absolute top-12 right-6"
            disabled={deleteImages.isPending}
            size="iconOnly"
            title="Delete"
            variant="ghost"
            onClick={handleDelete}
        >
            <Trash className="text-red-500 h-6 w-6" />
        </Button>
    );
};

export default function DraggableImageList({ initialImages, productId }: DraggableImageListProps): JSX.Element {
    const [images, setImages] = useState<ProductImage[]>(initialImages);

    const [draggedItem, setDraggedItem] = useState<number | null>(null);
    const [dragOverItem, setDragOverItem] = useState<number | null>(null);
    const [touchStartPos, setTouchStartPos] = useState<Position | null>(null);
    const [isTouching, setIsTouching] = useState<boolean>(false);

    const listRef = useRef<HTMLDivElement>(null);
    const itemRefs = useRef<(HTMLDivElement | null)[]>([]);

    const reorderImages = useReorderImages();

    useEffect(() => {
        itemRefs.current = itemRefs.current.slice(0, images.length);
    }, [images]);

    useEffect(() => {
        setImages(initialImages);
    }, [initialImages]);

    const handleDragStart = (e: React.DragEvent<HTMLDivElement>, index: number): void => {
        setDraggedItem(index);
        e.dataTransfer.effectAllowed = "move";

        if ((e.target as HTMLElement).tagName === "IMG") {
            e.dataTransfer.setDragImage(e.target as HTMLElement, 20, 20);
        }

        setTimeout(() => {
            if (itemRefs.current[index]) {
                itemRefs.current[index]?.classList.add("opacity-50");
            }
        }, 0);
    };

    const handleDragOver = (e: React.DragEvent<HTMLDivElement>, index: number): void => {
        e.preventDefault();
        setDragOverItem(index);
    };

    const handleDrop = (e: React.DragEvent<HTMLDivElement>): void => {
        e.preventDefault();
        reorderItems();
    };

    const handleDragEnd = (): void => {
        resetDragState();
    };

    const handleTouchStart = (e: React.TouchEvent<HTMLDivElement>, index: number): void => {
        const touch = e.touches[0];

        setTouchStartPos({
            x: touch.clientX,
            y: touch.clientY,
        });
        setDraggedItem(index);
        setIsTouching(true);

        if (itemRefs.current[index]) {
            itemRefs.current[index]?.classList.add("opacity-50");
        }
    };

    const handleTouchMove = (e: React.TouchEvent<HTMLDivElement>): void => {
        if (draggedItem === null || !isTouching) return;

        e.preventDefault();
        const touch = e.touches[0];

        const touchY = touch.clientY;

        if (listRef.current) {
            itemRefs.current.forEach((itemRef, index) => {
                if (!itemRef) return;

                const rect = itemRef.getBoundingClientRect();

                if (touchY >= rect.top && touchY <= rect.bottom && index !== draggedItem) {
                    setDragOverItem(index);
                }
            });
        }
    };

    const handleTouchEnd = (): void => {
        if (isTouching) {
            reorderItems();
        }
        resetDragState();
    };

    const reorderItems = async (): Promise<void> => {
        if (draggedItem !== null && dragOverItem !== null && draggedItem !== dragOverItem) {
            const newItems = [...images];
            const draggedItemContent = newItems[draggedItem];

            newItems.splice(draggedItem, 1);
            newItems.splice(dragOverItem, 0, draggedItemContent);

            setImages(newItems);

            const { error } = await reorderImages.mutateAsync({
                id: productId,
                imageIds: newItems.map((img) => img.id),
            });

            if (error) {
                setImages(initialImages);
            }
        }
    };

    const resetDragState = (): void => {
        if (draggedItem !== null && itemRefs.current[draggedItem]) {
            itemRefs.current[draggedItem]?.classList.remove("opacity-50");
        }

        setDraggedItem(null);
        setDragOverItem(null);
        setTouchStartPos(null);
        setIsTouching(false);
    };

    return (
        <div className="max-w-4xl mx-auto p-6 bg-content1 rounded-lg shadow-lg">
            <h2 className="text-xl font-bold text-default-800">Image Gallery</h2>
            <p className="mb-4 text-default-600">Drag and drop images to reorder them</p>

            <div ref={listRef} className="grid grid-cols-1 gap-4">
                {images.map((image: ProductImage, index: number) => (
                    <div
                        key={index}
                        ref={(el) => {
                            itemRefs.current[index] = el;
                        }}
                        draggable
                        className={`relative bg-card rounded-lg shadow-md transition-all duration-300 cursor-move touch-manipulation
                      ${dragOverItem === index ? "border-2 border-blue-400" : ""}
                      ${draggedItem === index ? "shadow-xl" : ""}`}
                        onDragEnd={handleDragEnd}
                        onDragOver={(e) => handleDragOver(e, index)}
                        onDragStart={(e) => handleDragStart(e, index)}
                        onDrop={handleDrop}
                        onTouchEnd={handleTouchEnd}
                        onTouchMove={handleTouchMove}
                        onTouchStart={(e) => handleTouchStart(e, index)}
                    >
                        <div className="flex items-center p-3 rounded-lg hover:bg-default-100">
                            <div className="mr-4 text-default-500 font-semibold w-8 h-8 flex items-center justify-center bg-default-200 rounded-full">
                                {index + 1}
                            </div>

                            <div className="shrink-0 mr-4">
                                <img alt={image.image} className="w-24 h-24 object-cover rounded" draggable={false} src={image.image} />
                            </div>

                            <div className="grow hidden md:block">
                                <div className="text-sm text-default-500 mt-1">
                                    {isTouching && draggedItem === index ? "Release to drop" : "Drag to reorder"}
                                </div>
                            </div>
                        </div>
                        <DeleteButton image={image} productId={productId} />
                        {dragOverItem === index && <div className="absolute inset-0 border-2 border-blue-400 rounded-lg pointer-events-none" />}
                    </div>
                ))}
            </div>
            <p className="text-xs text-default-500 text-center mt-3">Tip: Tap and hold the drag icon to reorder images on mobile</p>
        </div>
    );
}
