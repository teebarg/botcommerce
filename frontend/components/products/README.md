# Product Image Upload Components

This directory contains a comprehensive product image upload system with advanced features for managing product images in the e-commerce application.

## Components Overview

### 1. `ProductImageUpload` (Main Component)

The main orchestrator component that brings together all image upload functionality.

**Features:**

- Tabbed interface (Upload/Manage)
- Image selection with drag & drop
- Camera capture support
- Bulk editing capabilities
- Upload progress tracking
- Draft management with localStorage persistence

**Props:**

```typescript
interface ProductImageUploadProps {
    categories: Category[];
    collections: Collection[];
    variants: ProductVariant[];
    onImagesUploaded?: (images: ProductImageFile[]) => void;
    initialImages?: ProductImageFile[];
}
```

### 2. `ImageSelector`

Handles image selection from various sources.

**Features:**

- Drag & drop zone
- Camera capture (`capture="environment"`)
- Gallery selection
- File type validation
- Mobile-friendly interface

### 3. `ImagePreviewGrid`

Displays selected images in a responsive grid with management capabilities.

**Features:**

- Drag & drop reordering
- Image selection for bulk operations
- Primary image designation
- Upload status indicators
- Progress bars
- Hover actions (edit, remove, set primary)

### 4. `ImageMetadataEditor`

Modal for editing individual image metadata.

**Features:**

- Name and description editing
- Categories and collections assignment
- Product variant linking
- Tag management
- Alt text for accessibility
- Primary image toggle

### 5. `BulkEditImages`

Modal for bulk editing multiple images simultaneously.

**Features:**

- Apply categories to multiple images
- Apply collections to multiple images
- Apply variants to multiple images
- Add tags to multiple images

## Hooks

### `useProductDraft`

Manages product draft state with localStorage persistence.

**Features:**

- Auto-save every 30 seconds
- Save on page unload
- Draft restoration on page load
- Image management operations

### `useProductImageUpload`

Handles image upload operations with React Query.

**Features:**

- Progress tracking
- Error handling
- Retry functionality
- Optimistic updates

## Types

### `ProductImageFile`

```typescript
interface ProductImageFile {
    id: string;
    file: File;
    preview: string;
    metadata: ProductImageMetadata;
    uploadProgress: number;
    uploadStatus: "pending" | "uploading" | "success" | "error";
    error?: string;
}
```

### `ProductImageMetadata`

```typescript
interface ProductImageMetadata {
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
```

## Usage Example

```tsx
import ProductImageUpload from "@/components/products/product-image-upload";

function ProductForm() {
    const [uploadedImages, setUploadedImages] = useState<ProductImageFile[]>([]);

    return (
        <form>
            {/* Other form fields */}

            <ProductImageUpload
                categories={categories}
                collections={collections}
                variants={variants}
                onImagesUploaded={setUploadedImages}
                initialImages={existingImages}
            />

            {/* Submit button */}
        </form>
    );
}
```

## API Integration

The components expect an API endpoint at `/api/product-images` that accepts:

**POST Request:**

- `image`: File (single image upload)
- `metadata`: string (JSON metadata)
- `image_0`, `image_1`, ...: Files (multiple image upload)
- `meta_0`, `meta_1`, ...: string (JSON metadata for each image)

**Response:**

```json
{
    "success": true,
    "url": "https://example.com/uploads/image.jpg",
    "images": [
        {
            "id": "img_123",
            "url": "https://example.com/uploads/image.jpg",
            "metadata": { ... }
        }
    ]
}
```

## Mobile Support

- Touch-friendly interface
- Camera capture support
- Responsive design
- Bottom sheet interactions
- Gesture support for reordering

## Dependencies

- `@hello-pangea/dnd`: Drag and drop functionality
- `react-dropzone`: File upload handling
- `uuid`: Unique ID generation
- `@tanstack/react-query`: API state management
- `react-hook-form`: Form handling
- `zod`: Schema validation

## Installation

```bash
npm install @hello-pangea/dnd uuid
npm install --save-dev @types/uuid
```

## Demo

Visit `/admin/product-image-demo` to see the components in action with mock data.
