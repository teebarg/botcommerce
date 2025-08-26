import { useState, useEffect, useCallback } from "react";
import { v4 as uuidv4 } from "uuid";
import { toast } from "sonner";

import { ProductDraft, ProductImageFile } from "@/types/product-image";

const DRAFT_STORAGE_KEY = "product_draft";

export const useProductDraft = () => {
    const [draft, setDraft] = useState<ProductDraft | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    // Load draft from localStorage on mount
    useEffect(() => {
        const loadDraft = () => {
            try {
                const savedDraft = localStorage.getItem(DRAFT_STORAGE_KEY);

                if (savedDraft) {
                    const parsedDraft = JSON.parse(savedDraft);
                    // Revive object URLs for image previews
                    const revivedDraft = {
                        ...parsedDraft,
                        images: parsedDraft.images.map((img: any) => ({
                            ...img,
                            preview: img.preview || URL.createObjectURL(img.file),
                        })),
                    };

                    setDraft(revivedDraft);
                }
            } catch (error) {
                console.error("Failed to load draft:", error);
                toast.error("Failed to load saved draft");
            } finally {
                setIsLoading(false);
            }
        };

        loadDraft();
    }, []);

    // Save draft to localStorage
    const saveDraft = useCallback(
        (draftData: Partial<ProductDraft>) => {
            try {
                const updatedDraft = {
                    ...draft,
                    ...draftData,
                    updatedAt: new Date().toISOString(),
                };

                // Convert object URLs to strings for storage
                const draftForStorage = {
                    ...updatedDraft,
                    images: updatedDraft.images?.map((img) => ({
                        ...img,
                        preview: typeof img.preview === "string" ? img.preview : "",
                    })),
                };

                localStorage.setItem(DRAFT_STORAGE_KEY, JSON.stringify(draftForStorage));
                setDraft(updatedDraft as ProductDraft);
            } catch (error) {
                console.error("Failed to save draft:", error);
                toast.error("Failed to save draft");
            }
        },
        [draft]
    );

    // Create new draft
    const createDraft = useCallback(() => {
        const newDraft: ProductDraft = {
            id: uuidv4(),
            name: "",
            description: "",
            images: [],
            categories: [],
            collections: [],
            brand: 1,
            status: "IN_STOCK",
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
        };

        saveDraft(newDraft);

        return newDraft;
    }, [saveDraft]);

    // Add image to draft
    const addImage = useCallback(
        (image: ProductImageFile) => {
            if (!draft) return;

            const updatedImages = [...draft.images, image];

            saveDraft({ images: updatedImages });
        },
        [draft, saveDraft]
    );

    // Remove image from draft
    const removeImage = useCallback(
        (imageId: string) => {
            if (!draft) return;

            const updatedImages = draft.images.filter((img) => img.id !== imageId);

            saveDraft({ images: updatedImages });
        },
        [draft, saveDraft]
    );

    // Update image metadata
    const updateImageMetadata = useCallback(
        (imageId: string, metadata: Partial<ProductImageFile["metadata"]>) => {
            if (!draft) return;

            const updatedImages = draft.images.map((img) => (img.id === imageId ? { ...img, metadata: { ...img.metadata, ...metadata } } : img));

            saveDraft({ images: updatedImages });
        },
        [draft, saveDraft]
    );

    // Bulk update images
    const bulkUpdateImages = useCallback(
        (imageIds: string[], metadata: Partial<ProductImageFile["metadata"]>) => {
            if (!draft) return;

            const updatedImages = draft.images.map((img) =>
                imageIds.includes(img.id) ? { ...img, metadata: { ...img.metadata, ...metadata } } : img
            );

            saveDraft({ images: updatedImages });
        },
        [draft, saveDraft]
    );

    // Clear draft
    const clearDraft = useCallback(() => {
        localStorage.removeItem(DRAFT_STORAGE_KEY);
        setDraft(null);
        toast.success("Draft cleared");
    }, []);

    // Auto-save draft periodically
    useEffect(() => {
        if (!draft) return;

        const interval = setInterval(() => {
            saveDraft(draft);
        }, 30000); // Save every 30 seconds

        return () => clearInterval(interval);
    }, [draft, saveDraft]);

    // Save draft before page unload
    useEffect(() => {
        const handleBeforeUnload = () => {
            if (draft) {
                saveDraft(draft);
            }
        };

        window.addEventListener("beforeunload", handleBeforeUnload);

        return () => window.removeEventListener("beforeunload", handleBeforeUnload);
    }, [draft, saveDraft]);

    return {
        draft,
        isLoading,
        saveDraft,
        createDraft,
        addImage,
        removeImage,
        updateImageMetadata,
        bulkUpdateImages,
        clearDraft,
    };
};
