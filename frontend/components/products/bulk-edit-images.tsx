"use client";

import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Edit3, Save, X, Hash } from "lucide-react";

import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import MultiSelect from "@/components/ui/multi-select";
import { BulkEditData, Category, Collection, ProductVariant } from "@/types/product-image";

const bulkEditSchema = z.object({
    categories: z.array(z.any()).optional(),
    collections: z.array(z.any()).optional(),
    variants: z.array(z.any()).optional(),
    tags: z.array(z.string()).optional(),
});

interface BulkEditImagesProps {
    isOpen: boolean;
    onClose: () => void;
    selectedImages: string[];
    onBulkEdit: (imageIds: string[], data: BulkEditData) => void;
    categories: Category[];
    collections: Collection[];
    variants: ProductVariant[];
}

const BulkEditImages: React.FC<BulkEditImagesProps> = ({ isOpen, onClose, selectedImages, onBulkEdit, categories, collections, variants }) => {
    const [newTag, setNewTag] = useState("");
    const [tags, setTags] = useState<string[]>([]);

    const form = useForm<z.infer<typeof bulkEditSchema>>({
        resolver: zodResolver(bulkEditSchema),
        defaultValues: {
            categories: [],
            collections: [],
            variants: [],
            tags: [],
        },
    });

    const handleAddTag = () => {
        if (newTag.trim() && !tags.includes(newTag.trim())) {
            const updatedTags = [...tags, newTag.trim()];

            setTags(updatedTags);
            form.setValue("tags", updatedTags);
            setNewTag("");
        }
    };

    const handleRemoveTag = (tagToRemove: string) => {
        const updatedTags = tags.filter((tag) => tag !== tagToRemove);

        setTags(updatedTags);
        form.setValue("tags", updatedTags);
    };

    const handleKeyPress = (e: React.KeyboardEvent) => {
        if (e.key === "Enter") {
            e.preventDefault();
            handleAddTag();
        }
    };

    const onSubmit = (values: z.infer<typeof bulkEditSchema>) => {
        const bulkEditData: BulkEditData = {
            ...values,
            tags: tags.length > 0 ? tags : undefined,
        };

        // Only include fields that have values
        const filteredData = Object.fromEntries(
            Object.entries(bulkEditData).filter(([_, value]) => value !== undefined && (Array.isArray(value) ? value.length > 0 : true))
        );

        onBulkEdit(selectedImages, filteredData);
        handleClose();
    };

    const handleClose = () => {
        form.reset();
        setTags([]);
        setNewTag("");
        onClose();
    };

    return (
        <Dialog open={isOpen} onOpenChange={handleClose}>
            <DialogContent className="max-w-lg">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                        <Edit3 className="w-5 h-5" />
                        Bulk Edit Images ({selectedImages.length})
                    </DialogTitle>
                </DialogHeader>

                <div className="space-y-6">
                    <div className="p-3 bg-blue-50 rounded-lg">
                        <p className="text-sm text-blue-800">
                            Changes will be applied to {selectedImages.length} selected image{selectedImages.length !== 1 ? "s" : ""}.
                        </p>
                    </div>

                    <Form {...form}>
                        <form className="space-y-4" onSubmit={form.handleSubmit(onSubmit)}>
                            {/* Categories */}
                            <FormField
                                control={form.control}
                                name="categories"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Add Categories</FormLabel>
                                        <FormControl>
                                            <MultiSelect
                                                name={field.name}
                                                options={categories.map((category) => ({
                                                    value: category.id,
                                                    label: category.name,
                                                }))}
                                                placeholder="Select categories to add..."
                                                value={field.value}
                                                onChange={field.onChange}
                                            />
                                        </FormControl>
                                        <p className="text-xs text-gray-500">These categories will be added to all selected images</p>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            {/* Collections */}
                            <FormField
                                control={form.control}
                                name="collections"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Add Collections</FormLabel>
                                        <FormControl>
                                            <MultiSelect
                                                name={field.name}
                                                options={collections.map((collection) => ({
                                                    value: collection.id,
                                                    label: collection.name,
                                                }))}
                                                placeholder="Select collections to add..."
                                                value={field.value}
                                                onChange={field.onChange}
                                            />
                                        </FormControl>
                                        <p className="text-xs text-gray-500">These collections will be added to all selected images</p>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            {/* Variants */}
                            <FormField
                                control={form.control}
                                name="variants"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Add Product Variants</FormLabel>
                                        <FormControl>
                                            <MultiSelect
                                                name={field.name}
                                                options={variants.map((variant) => ({
                                                    value: variant.id,
                                                    label: `${variant.name} - ${variant.sku}`,
                                                }))}
                                                placeholder="Select variants to add..."
                                                value={field.value}
                                                onChange={field.onChange}
                                            />
                                        </FormControl>
                                        <p className="text-xs text-gray-500">These variants will be added to all selected images</p>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            {/* Tags */}
                            <FormField
                                control={form.control}
                                name="tags"
                                render={() => (
                                    <FormItem>
                                        <FormLabel>Add Tags</FormLabel>
                                        <FormControl>
                                            <div className="space-y-2">
                                                <div className="flex gap-2">
                                                    <Input
                                                        className="flex-1"
                                                        placeholder="Add a tag..."
                                                        value={newTag}
                                                        onChange={(e) => setNewTag(e.target.value)}
                                                        onKeyPress={handleKeyPress}
                                                    />
                                                    <Button disabled={!newTag.trim()} type="button" variant="outline" onClick={handleAddTag}>
                                                        <Hash className="w-4 h-4" />
                                                    </Button>
                                                </div>
                                                {tags.length > 0 && (
                                                    <div className="flex flex-wrap gap-2">
                                                        {tags.map((tag) => (
                                                            <Badge key={tag} className="flex items-center gap-1" variant="secondary">
                                                                {tag}
                                                                <button
                                                                    className="ml-1 hover:text-red-500"
                                                                    type="button"
                                                                    onClick={() => handleRemoveTag(tag)}
                                                                >
                                                                    <X className="w-3 h-3" />
                                                                </button>
                                                            </Badge>
                                                        ))}
                                                    </div>
                                                )}
                                            </div>
                                        </FormControl>
                                        <p className="text-xs text-gray-500">These tags will be added to all selected images</p>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            {/* Action Buttons */}
                            <div className="flex justify-end gap-3 pt-4">
                                <Button type="button" variant="outline" onClick={handleClose}>
                                    Cancel
                                </Button>
                                <Button className="flex items-center gap-2" type="submit">
                                    <Save className="w-4 h-4" />
                                    Apply to {selectedImages.length} Images
                                </Button>
                            </div>
                        </form>
                    </Form>
                </div>
            </DialogContent>
        </Dialog>
    );
};

export default BulkEditImages;
