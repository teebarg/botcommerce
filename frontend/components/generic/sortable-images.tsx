import React, { useEffect, useState } from "react";
import { DndContext, closestCenter, PointerSensor, useSensor, useSensors, TouchSensor } from "@dnd-kit/core";
import { arrayMove, SortableContext, sortableKeyboardCoordinates, useSortable, verticalListSortingStrategy } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { KeyboardSensor } from "@dnd-kit/core";
import { toast } from "sonner";
import { GripVertical, Trash2 } from "lucide-react";

import { ProductImage } from "@/types/models";
import { api } from "@/apis";
import { useInvalidate } from "@/lib/hooks/useApi";

interface Props {
    productId: number;
    initialImages: ProductImage[];
}

const SortableImage = ({ image, productId }: { image: ProductImage; productId: number }) => {
    const invalidate = useInvalidate();
    const { attributes, listeners, setNodeRef, transform, transition } = useSortable({ id: image.id });
    const [isDeleting, setIsDeleting] = useState<boolean>(false);

    const style = {
        transform: CSS.Transform.toString(transform),
        transition,
    };

    const handleDelete = async () => {
        setIsDeleting(true);

        await api.product.deleteImages(productId, image.id);
        invalidate("products");
        invalidate("product-search");
        api.product.revalidate();
        setIsDeleting(false);
    };

    return (
        <div
            ref={setNodeRef}
            className="relative group w-full aspect-square h-48 overflow-hidden rounded-xl border bg-white shadow-sm"
            style={style}
            {...attributes}
        >
            {/* Image Preview */}
            <img alt="Product" className="object-contain w-full h-full" src={image.image} />

            {/* Drag Handle */}
            <div
                {...listeners}
                className="absolute top-1 left-1 bg-white/80 rounded-full p-1 opacity-0 group-hover:opacity-100 transition"
                title="Hold to drag"
            >
                <GripVertical className="text-gray-600" size={18} />
            </div>

            {/* Delete Button */}
            <button
                className="absolute top-1 right-1 bg-white/80 rounded-full p-1 text-red-500 hover:text-red-700 opacity-0 group-hover:opacity-100 transition"
                disabled={isDeleting}
                title="Delete"
                onClick={handleDelete}
            >
                <Trash2 size={18} />
            </button>
        </div>
    );
};

export default function ImageReorder({ productId, initialImages }: Props) {
    const invalidate = useInvalidate();
    const [images, setImages] = useState<ProductImage[]>(initialImages);

    useEffect(() => {
        setImages(initialImages);
    }, [initialImages]);

    const sensors = useSensors(
        useSensor(PointerSensor),
        useSensor(TouchSensor, {
            activationConstraint: {
                delay: 300, // hold for 300ms to start drag
                tolerance: 8, // small finger movement tolerance
            },
        }),
        useSensor(KeyboardSensor, {
            coordinateGetter: sortableKeyboardCoordinates,
        })
    );

    const handleDragEnd = async (event: any) => {
        const { active, over } = event;

        if (active.id !== over.id) {
            const oldIndex = images.findIndex((img) => img.id === active.id);
            const newIndex = images.findIndex((img) => img.id === over.id);

            const newImages = arrayMove(images, oldIndex, newIndex);

            setImages(newImages);

            const { error } = await api.product.reorderImages(
                productId,
                newImages.map((img: ProductImage) => img.id)
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

    return (
        <div className="mt-6 px-4">
            <h2 className="text-xl font-semibold mb-4 text-center">Reorder Product Images</h2>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                <DndContext collisionDetection={closestCenter} sensors={sensors} onDragEnd={handleDragEnd}>
                    <SortableContext items={images.map((img) => img.id)} strategy={verticalListSortingStrategy}>
                        {images.map((img: ProductImage, idx: number) => (
                            <SortableImage key={idx} image={img} productId={productId} />
                        ))}
                    </SortableContext>
                </DndContext>
            </div>
            <p className="text-xs text-gray-400 text-center mt-3">Tip: Tap and hold the drag icon to reorder images on mobile</p>
        </div>
    );
}
