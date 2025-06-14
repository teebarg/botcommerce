"use client";

import React, { useState, useRef, useEffect } from "react";
import { toast } from "sonner";

import { ProductImage } from "@/schemas";
import { api } from "@/apis";
import { useInvalidate } from "@/lib/hooks/useApi";

// TypeScript interfaces
interface DraggableImageListProps {
    initialImages: ProductImage[];
    productId: number;
}

interface Position {
    x: number;
    y: number;
}

export default function DraggableImageList({ initialImages, productId }: DraggableImageListProps): JSX.Element {
    const invalidate = useInvalidate();
    // Sample image data - replace with your own images
    const [images, setImages] = useState<ProductImage[]>(initialImages);

    const [draggedItem, setDraggedItem] = useState<number | null>(null);
    const [dragOverItem, setDragOverItem] = useState<number | null>(null);
    const [touchStartPos, setTouchStartPos] = useState<Position | null>(null);
    const [isTouching, setIsTouching] = useState<boolean>(false);

    // References
    const listRef = useRef<HTMLDivElement>(null);
    const itemRefs = useRef<(HTMLDivElement | null)[]>([]);

    // Resize itemRefs array when images array changes
    useEffect(() => {
        itemRefs.current = itemRefs.current.slice(0, images.length);
    }, [images]);

    useEffect(() => {
        setImages(initialImages);
    }, [initialImages]);

    // Handle desktop drag start
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

    // Handle desktop drag over
    const handleDragOver = (e: React.DragEvent<HTMLDivElement>, index: number): void => {
        e.preventDefault();
        setDragOverItem(index);
    };

    // Handle desktop drop
    const handleDrop = (e: React.DragEvent<HTMLDivElement>): void => {
        e.preventDefault();
        reorderItems();
    };

    // Handle desktop drag end
    const handleDragEnd = (): void => {
        resetDragState();
    };

    // Handle mobile touch start
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

    // Handle mobile touch move
    const handleTouchMove = (e: React.TouchEvent<HTMLDivElement>): void => {
        if (draggedItem === null || !isTouching) return;

        e.preventDefault(); // Prevent scrolling while dragging
        const touch = e.touches[0];

        // Find which item is under the touch point
        const touchY = touch.clientY;

        if (listRef.current) {
            itemRefs.current.forEach((itemRef, index) => {
                if (!itemRef) return;

                const rect = itemRef.getBoundingClientRect();

                // If touch is within this item's bounds and it's not the dragged item
                if (touchY >= rect.top && touchY <= rect.bottom && index !== draggedItem) {
                    setDragOverItem(index);
                }
            });
        }
    };

    // Handle mobile touch end
    const handleTouchEnd = (): void => {
        if (isTouching) {
            reorderItems();
        }
        resetDragState();
    };

    // Common function to reorder items
    const reorderItems = async (): Promise<void> => {
        if (draggedItem !== null && dragOverItem !== null && draggedItem !== dragOverItem) {
            const newItems = [...images];
            const draggedItemContent = newItems[draggedItem];

            // Remove the dragged item
            newItems.splice(draggedItem, 1);

            // Insert at the new position
            newItems.splice(dragOverItem, 0, draggedItemContent);

            // Update state with the new order
            setImages(newItems);

            const { error } = await api.product.reorderImages(
                productId,
                newItems.map((img) => img.id)
            );

            if (error) {
                toast.error(`Error - ${error}`);
                setImages(initialImages);
            }

            invalidate("products");
            invalidate("product-search");
            api.product.revalidate();
        }
    };

    // Common function to reset state
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
        <div className="max-w-4xl mx-auto p-6 bg-white rounded-lg shadow-lg">
            <h2 className="text-2xl font-bold mb-6 text-gray-800">Image Gallery</h2>
            <p className="mb-4 text-gray-600">Drag and drop images to reorder them</p>

            <div ref={listRef} className="grid grid-cols-1 gap-4">
                {images.map((image: ProductImage, index: number) => (
                    <div
                        key={index}
                        ref={(el) => {
                            itemRefs.current[index] = el;
                        }}
                        draggable
                        className={`relative bg-gray-50 rounded-lg shadow-md transition-all duration-300 cursor-move touch-manipulation
                      ${dragOverItem === index ? "border-2 border-blue-400" : ""}
                      ${draggedItem === index ? "shadow-xl" : ""}`}
                        onDragEnd={handleDragEnd}
                        onDragOver={(e) => handleDragOver(e, index)}
                        onDragStart={(e) => handleDragStart(e, index)}
                        onDrop={handleDrop}
                        onTouchEnd={handleTouchEnd}
                        // Mobile events
                        onTouchMove={handleTouchMove}
                        // Desktop events
                        onTouchStart={(e) => handleTouchStart(e, index)}
                    >
                        <div className="flex items-center p-3 rounded-lg hover:bg-gray-100">
                            <div className="mr-4 text-gray-500 font-semibold w-8 h-8 flex items-center justify-center bg-gray-200 rounded-full">
                                {index + 1}
                            </div>

                            <div className="shrink-0 mr-4">
                                <img
                                    alt={image.image}
                                    className="w-24 h-24 object-cover rounded"
                                    draggable={false} // Prevent image dragging to avoid conflicts
                                    src={image.image}
                                />
                            </div>

                            <div className="grow">
                                <h3 className="font-medium text-gray-800">{image.image}</h3>
                                <div className="text-sm text-gray-500 mt-1">
                                    {isTouching && draggedItem === index ? "Release to drop" : "Drag to reorder"}
                                </div>
                            </div>

                            <div className="w-10 flex items-center justify-center">
                                <svg
                                    className="w-6 h-6 text-gray-400"
                                    fill="none"
                                    stroke="currentColor"
                                    viewBox="0 0 24 24"
                                    xmlns="http://www.w3.org/2000/svg"
                                >
                                    <path d="M4 6h16M4 12h16m-7 6h7" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" />
                                </svg>
                            </div>
                        </div>

                        {dragOverItem === index && <div className="absolute inset-0 border-2 border-blue-400 rounded-lg pointer-events-none" />}
                    </div>
                ))}
            </div>
        </div>
    );
}
