"use client";

import React, { useState, useEffect } from "react";
import { Upload, Edit3, Trash2, Image as ImageIcon, Settings, Save, RotateCcw } from "lucide-react";

import ImageSelector from "./image-selector";
import ImagePreviewGrid from "./image-preview-grid";
import ImageMetadataEditor from "./image-metadata-editor";
import BulkEditImages from "./bulk-edit-images";

import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useProductDraft } from "@/lib/hooks/useProductDraft";
import { useProductImageUploadWithProgress, useBulkEditImages } from "@/lib/hooks/useProductImageUpload";
import { ProductImageFile, ProductImageMetadata, BulkEditData } from "@/types/product-image";
import { Category, Collection, ProductVariant } from "@/schemas/product";

interface ProductImageUploadProps {
    categories: Category[];
    collections: Collection[];
    variants: ProductVariant[];
    onImagesUploaded?: (images: ProductImageFile[]) => void;
    initialImages?: ProductImageFile[];
}

const ProductImageUpload: React.FC<ProductImageUploadProps> = ({ categories, collections, variants, onImagesUploaded, initialImages = [] }) => {
    const [selectedImages, setSelectedImages] = useState<string[]>([]);
    const [editingImage, setEditingImage] = useState<{
        id: string;
        preview: string;
        metadata: ProductImageMetadata;
    } | null>(null);
    const [isBulkEditOpen, setIsBulkEditOpen] = useState(false);
    const [isEditing, setIsEditing] = useState(false);
    const [uploadProgress, setUploadProgress] = useState<Record<string, number>>({});

    const { draft, isLoading: draftLoading, addImage, removeImage, updateImageMetadata, bulkUpdateImages, clearDraft } = useProductDraft();

    const uploadMutation = useProductImageUploadWithProgress();
    const bulkEditMutation = useBulkEditImages();

    // Initialize with initial images if provided
    useEffect(() => {
        if (initialImages.length > 0 && draft?.images.length === 0) {
            initialImages.forEach((image) => addImage(image));
        }
    }, [initialImages, draft?.images.length, addImage]);

    const handleImagesSelected = (images: ProductImageFile[]) => {
        images.forEach((image) => addImage(image));
    };

    const handleRemoveImage = (imageId: string) => {
        removeImage(imageId);
        setSelectedImages((prev) => prev.filter((id) => id !== imageId));
    };

    const handleEditImage = (imageId: string) => {
        const image = draft?.images.find((img) => img.id === imageId);

        if (image) {
            setEditingImage({
                id: image.id,
                preview: image.preview,
                metadata: image.metadata,
            });
        }
    };

    const handleSaveImageMetadata = (imageId: string, metadata: ProductImageMetadata) => {
        updateImageMetadata(imageId, metadata);
        setEditingImage(null);
    };

    const handleReorderImages = (images: ProductImageFile[]) => {
        // Update the draft with reordered images
        // This would need to be implemented in the useProductDraft hook
        console.log("Reordered images:", images);
    };

    const handleTogglePrimary = (imageId: string) => {
        const image = draft?.images.find((img) => img.id === imageId);

        if (image) {
            // Remove primary from all other images
            draft?.images.forEach((img) => {
                if (img.id !== imageId) {
                    updateImageMetadata(img.id, { isPrimary: false });
                }
            });
            // Set this image as primary
            updateImageMetadata(imageId, { isPrimary: true });
        }
    };

    const handleBulkEdit = (imageIds: string[], data: BulkEditData) => {
        bulkUpdateImages(imageIds, data);
        setSelectedImages([]);
    };

    const handleUploadImages = async () => {
        if (!draft?.images.length) return;

        const imagesToUpload = draft.images.filter((img) => img.uploadStatus === "pending");

        if (imagesToUpload.length === 0) return;

        try {
            await uploadMutation.mutateAsync(imagesToUpload);
            onImagesUploaded?.(draft.images);
        } catch (error) {
            console.error("Upload failed:", error);
        }
    };

    const handleRetryUpload = async (imageId: string) => {
        const image = draft?.images.find((img) => img.id === imageId);

        if (image && image.uploadStatus === "error") {
            try {
                await uploadMutation.mutateAsync([image]);
            } catch (error) {
                console.error("Retry failed:", error);
            }
        }
    };

    const getUploadStats = () => {
        if (!draft?.images.length) return { pending: 0, uploading: 0, success: 0, error: 0 };

        return draft.images.reduce(
            (stats, img) => {
                stats[img.uploadStatus]++;

                return stats;
            },
            { pending: 0, uploading: 0, success: 0, error: 0 } as Record<string, number>
        );
    };

    const stats = getUploadStats();

    if (draftLoading) {
        return (
            <div className="flex items-center justify-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500" />
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <ImageIcon className="w-6 h-6 text-blue-600" />
                    <div>
                        <h3 className="text-lg font-semibold">Product Images</h3>
                        <p className="text-sm text-gray-500">Upload and manage product images</p>
                    </div>
                </div>

                <div className="flex items-center gap-2">
                    {draft?.images.length && (
                        <>
                            <Button size="sm" type="button" variant="outline" onClick={() => setIsEditing(!isEditing)}>
                                <Edit3 className="w-4 h-4 mr-2" />
                                {isEditing ? "Done" : "Edit"}
                            </Button>

                            {isEditing && selectedImages.length > 0 && (
                                <Button size="sm" type="button" variant="outline" onClick={() => setIsBulkEditOpen(true)}>
                                    <Edit3 className="w-4 h-4 mr-2" />
                                    Bulk Edit ({selectedImages.length})
                                </Button>
                            )}
                        </>
                    )}
                </div>
            </div>

            {/* Upload Stats */}
            {draft?.images.length && (
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 p-4 bg-gray-50 rounded-lg">
                    <div className="text-center">
                        <div className="text-2xl font-bold text-blue-600">{stats.pending}</div>
                        <div className="text-xs text-gray-500">Pending</div>
                    </div>
                    <div className="text-center">
                        <div className="text-2xl font-bold text-yellow-600">{stats.uploading}</div>
                        <div className="text-xs text-gray-500">Uploading</div>
                    </div>
                    <div className="text-center">
                        <div className="text-2xl font-bold text-green-600">{stats.success}</div>
                        <div className="text-xs text-gray-500">Success</div>
                    </div>
                    <div className="text-center">
                        <div className="text-2xl font-bold text-red-600">{stats.error}</div>
                        <div className="text-xs text-gray-500">Failed</div>
                    </div>
                </div>
            )}

            <Tabs className="w-full" defaultValue="upload">
                <TabsList className="grid w-full grid-cols-2">
                    <TabsTrigger className="flex items-center gap-2" value="upload">
                        <Upload className="w-4 h-4" />
                        Upload Images
                    </TabsTrigger>
                    <TabsTrigger className="flex items-center gap-2" value="manage">
                        <Settings className="w-4 h-4" />
                        Manage Images
                    </TabsTrigger>
                </TabsList>

                <TabsContent className="space-y-4" value="upload">
                    <ImageSelector
                        maxFileSize={15 * 1024 * 1024} // 15MB
                        maxImages={20}
                        onImagesSelected={handleImagesSelected}
                    />
                </TabsContent>

                <TabsContent className="space-y-4" value="manage">
                    {draft?.images.length === 0 ? (
                        <div className="text-center py-8 text-gray-500">
                            <ImageIcon className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                            <p>No images uploaded yet</p>
                            <p className="text-sm">Switch to the Upload tab to add images</p>
                        </div>
                    ) : (
                        <>
                            <ImagePreviewGrid
                                images={draft?.images!}
                                isEditing={isEditing}
                                selectedImages={selectedImages}
                                onEditImage={handleEditImage}
                                onRemoveImage={handleRemoveImage}
                                onReorderImages={handleReorderImages}
                                onSelectImages={setSelectedImages}
                                onTogglePrimary={handleTogglePrimary}
                            />

                            <Separator />

                            {/* Action Buttons */}
                            <div className="flex flex-col sm:flex-row gap-3 justify-between items-center">
                                <div className="flex items-center gap-2">
                                    <Button disabled={uploadMutation.isPending} size="sm" type="button" variant="outline" onClick={clearDraft}>
                                        <Trash2 className="w-4 h-4 mr-2" />
                                        Clear All
                                    </Button>

                                    {stats.error > 0 && (
                                        <Button
                                            size="sm"
                                            type="button"
                                            variant="outline"
                                            onClick={() => {
                                                draft?.images
                                                    .filter((img) => img.uploadStatus === "error")
                                                    .forEach((img) => handleRetryUpload(img.id));
                                            }}
                                        >
                                            <RotateCcw className="w-4 h-4 mr-2" />
                                            Retry Failed
                                        </Button>
                                    )}
                                </div>

                                <div className="flex gap-3">
                                    <Button
                                        disabled={uploadMutation.isPending}
                                        type="button"
                                        variant="outline"
                                        onClick={() => onImagesUploaded?.(draft?.images!)}
                                    >
                                        <Save className="w-4 h-4 mr-2" />
                                        Save as Draft
                                    </Button>

                                    <Button
                                        disabled={uploadMutation.isPending || stats.pending === 0}
                                        isLoading={uploadMutation.isPending}
                                        type="button"
                                        onClick={handleUploadImages}
                                    >
                                        <Upload className="w-4 h-4 mr-2" />
                                        Upload {stats.pending > 0 && `(${stats.pending})`}
                                    </Button>
                                </div>
                            </div>
                        </>
                    )}
                </TabsContent>
            </Tabs>

            {/* Modals */}
            <ImageMetadataEditor
                categories={categories}
                collections={collections}
                image={editingImage}
                isOpen={!!editingImage}
                variants={variants}
                onClose={() => setEditingImage(null)}
                onSave={handleSaveImageMetadata}
            />

            <BulkEditImages
                categories={categories}
                collections={collections}
                isOpen={isBulkEditOpen}
                selectedImages={selectedImages}
                variants={variants}
                onBulkEdit={handleBulkEdit}
                onClose={() => setIsBulkEditOpen(false)}
            />
        </div>
    );
};

export default ProductImageUpload;
