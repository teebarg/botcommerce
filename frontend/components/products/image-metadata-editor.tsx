"use client";

import React, { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { X, Save, Tag, Hash } from "lucide-react";

import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import MultiSelect from "@/components/ui/multi-select";
import { ProductImageMetadata, Category, Collection, ProductVariant } from "@/types/product-image";

const metadataSchema = z.object({
    name: z.string().min(1, "Name is required"),
    description: z.string().optional(),
    altText: z.string().min(1, "Alt text is required for accessibility"),
    categories: z.array(z.any()).optional(),
    collections: z.array(z.any()).optional(),
    variants: z.array(z.any()).optional(),
    tags: z.array(z.string()).optional(),
    isPrimary: z.boolean().optional(),
});

interface ImageMetadataEditorProps {
    isOpen: boolean;
    onClose: () => void;
    image: {
        id: string;
        preview: string;
        metadata: ProductImageMetadata;
    } | null;
    onSave: (imageId: string, metadata: ProductImageMetadata) => void;
    categories: Category[];
    collections: Collection[];
    variants: ProductVariant[];
}

const ImageMetadataEditor: React.FC<ImageMetadataEditorProps> = ({ isOpen, onClose, image, onSave, categories, collections, variants }) => {
    const [newTag, setNewTag] = useState("");
    const [tags, setTags] = useState<string[]>([]);

    const form = useForm<z.infer<typeof metadataSchema>>({
        resolver: zodResolver(metadataSchema),
        defaultValues: {
            name: "",
            description: "",
            altText: "",
            categories: [],
            collections: [],
            variants: [],
            tags: [],
            isPrimary: false,
        },
    });

    // Update form when image changes
    useEffect(() => {
        if (image) {
            form.reset({
                name: image.metadata.name,
                description: image.metadata.description,
                altText: image.metadata.altText,
                categories: image.metadata.categories,
                collections: image.metadata.collections,
                variants: image.metadata.variants,
                tags: image.metadata.tags,
                isPrimary: image.metadata.isPrimary,
            });
            setTags(image.metadata.tags);
        }
    }, [image, form]);

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

    const onSubmit = (values: z.infer<typeof metadataSchema>) => {
        if (!image) return;

        const updatedMetadata: ProductImageMetadata = {
            ...image.metadata,
            ...values,
            tags,
        };

        onSave(image.id, updatedMetadata);
        onClose();
    };

    const handleClose = () => {
        form.reset();
        setTags([]);
        setNewTag("");
        onClose();
    };

    return (
        <Dialog open={isOpen} onOpenChange={handleClose}>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                        <Tag className="w-5 h-5" />
                        Edit Image Metadata
                    </DialogTitle>
                </DialogHeader>

                {image && (
                    <div className="space-y-6">
                        {/* Image Preview */}
                        <div className="flex gap-4">
                            <div className="w-32 h-32 rounded-lg overflow-hidden border">
                                <img alt={image.metadata.name} className="w-full h-full object-cover" src={image.preview} />
                            </div>
                            <div className="flex-1">
                                <p className="text-sm text-gray-500 mb-2">Image Preview</p>
                                <p className="text-xs text-gray-400">File: {image.metadata.name}</p>
                            </div>
                        </div>

                        <Form {...form}>
                            <form className="space-y-4" onSubmit={form.handleSubmit(onSubmit)}>
                                {/* Name */}
                                <FormField
                                    control={form.control}
                                    name="name"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Image Name *</FormLabel>
                                            <FormControl>
                                                <Input placeholder="Enter image name" {...field} />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />

                                {/* Description */}
                                <FormField
                                    control={form.control}
                                    name="description"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Description</FormLabel>
                                            <FormControl>
                                                <Textarea placeholder="Describe this image..." rows={3} {...field} />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />

                                {/* Alt Text */}
                                <FormField
                                    control={form.control}
                                    name="altText"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Alt Text *</FormLabel>
                                            <FormControl>
                                                <Input placeholder="Describe the image for accessibility" {...field} />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />

                                {/* Categories */}
                                <FormField
                                    control={form.control}
                                    name="categories"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Categories</FormLabel>
                                            <FormControl>
                                                <MultiSelect
                                                    name={field.name}
                                                    options={categories.map((category) => ({
                                                        value: category.id,
                                                        label: category.name,
                                                    }))}
                                                    placeholder="Select categories..."
                                                    value={field.value}
                                                    onChange={field.onChange}
                                                />
                                            </FormControl>
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
                                            <FormLabel>Collections</FormLabel>
                                            <FormControl>
                                                <MultiSelect
                                                    name={field.name}
                                                    options={collections.map((collection) => ({
                                                        value: collection.id,
                                                        label: collection.name,
                                                    }))}
                                                    placeholder="Select collections..."
                                                    value={field.value}
                                                    onChange={field.onChange}
                                                />
                                            </FormControl>
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
                                            <FormLabel>Product Variants</FormLabel>
                                            <FormControl>
                                                <MultiSelect
                                                    name={field.name}
                                                    options={variants.map((variant) => ({
                                                        value: variant.id,
                                                        label: `${variant.name} - ${variant.sku}`,
                                                    }))}
                                                    placeholder="Select variants..."
                                                    value={field.value}
                                                    onChange={field.onChange}
                                                />
                                            </FormControl>
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
                                            <FormLabel>Tags</FormLabel>
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
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />

                                {/* Primary Image Toggle */}
                                <FormField
                                    control={form.control}
                                    name="isPrimary"
                                    render={({ field }) => (
                                        <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                                            <div className="space-y-0.5">
                                                <FormLabel className="text-base">Set as Primary Image</FormLabel>
                                                <p className="text-sm text-gray-500">This image will be displayed as the main product image</p>
                                            </div>
                                            <FormControl>
                                                <input checked={field.value} className="w-4 h-4" type="checkbox" onChange={field.onChange} />
                                            </FormControl>
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
                                        Save Changes
                                    </Button>
                                </div>
                            </form>
                        </Form>
                    </div>
                )}
            </DialogContent>
        </Dialog>
    );
};

export default ImageMetadataEditor;
