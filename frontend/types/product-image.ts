export interface ProductImageMetadata {
    id: string;
    name: string;
    description: string;
    categories: Array<{ value: number; label: string }>;
    collections: Array<{ value: number; label: string }>;
    variants: Array<{ value: number; label: string }>;
    tags: string[];
    altText: string;
    isPrimary: boolean;
}

// Type aliases for compatibility with existing schemas
export type Category = {
    id: number;
    name: string;
    slug: string;
    is_active: boolean;
};

export type Collection = {
    id: number;
    name: string;
    slug: string;
    is_active: boolean;
};

export type ProductVariant = {
    id: number;
    name: string;
    sku: string;
    price: number;
    status: string;
};

// Utility functions
export const createImageMetadata = (file: File): ProductImageMetadata => ({
    id: crypto.randomUUID(),
    name: file.name.replace(/\.[^/.]+$/, ""), // Remove file extension
    description: "",
    categories: [],
    collections: [],
    variants: [],
    tags: [],
    altText: "",
    isPrimary: false,
});

export const createProductImageFile = (file: File): ProductImageFile => ({
    id: crypto.randomUUID(),
    file,
    preview: URL.createObjectURL(file),
    metadata: createImageMetadata(file),
    uploadProgress: 0,
    uploadStatus: "pending",
});

export interface ProductImageFile {
    id: string;
    file: File;
    preview: string;
    metadata: ProductImageMetadata;
    uploadProgress: number;
    uploadStatus: "pending" | "uploading" | "success" | "error";
    error?: string;
}

export interface BulkEditData {
    categories?: Array<{ value: number; label: string }>;
    collections?: Array<{ value: number; label: string }>;
    variants?: Array<{ value: number; label: string }>;
    tags?: string[];
}

export interface ImageUploadResponse {
    success: boolean;
    images: Array<{
        id: string;
        url: string;
        metadata: ProductImageMetadata;
    }>;
    errors?: Array<{
        id: string;
        error: string;
    }>;
}

export interface ProductDraft {
    id: string;
    name: string;
    description: string;
    images: ProductImageFile[];
    categories: Array<{ value: number; label: string }>;
    collections: Array<{ value: number; label: string }>;
    brand: number;
    status: string;
    createdAt: string;
    updatedAt: string;
}
