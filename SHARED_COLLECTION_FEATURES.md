# Shared Collection Features - Admin Manage Slate

This document describes the new features added to the shared collection system that allow admins to add products to shared collections while browsing the site.

## New Features

### 1. Manage Slate Button

- **Location**: Product cards, product detail pages, and product search results
- **Visibility**: Only visible to admin users
- **Functionality**: Opens a modal showing all available shared collections where the admin can add or remove the current product

### 2. Product Collection Indicator

- **Location**: Product cards and product detail pages
- **Visibility**: Only visible to admin users
- **Functionality**: Shows a green checkmark and badge indicating how many collections the product is already in

### 3. Real-time Status Updates with Add/Remove Functionality

- **Functionality**: Shows real-time status of whether a product is already in a collection
- **Visual Feedback**:
  - Green checkmark and "Added" text for products already in a collection
  - "Add" button for products not yet in a collection
  - "Remove" button (red with trash icon) for products already in a collection
  - Disabled state for inactive collections
- **Actions**: Admins can add products to collections or remove them directly from the modal

## API Endpoints

### New Endpoints Added

1. **POST** `/shared/{id}/add-product/{product_id}`
   - Adds a product to a shared collection
   - Requires admin authentication
   - Returns success message or error if product already exists

2. **DELETE** `/shared/{id}/remove-product/{product_id}`
   - Removes a product from a shared collection
   - Requires admin authentication
   - Returns success message

3. **GET** `/shared/{id}/has-product/{product_id}`
   - Checks if a product is already in a shared collection
   - Returns `{"has_product": boolean}`

## Frontend Components

### 1. ManageSlate Component

- **File**: `frontend/components/admin/shared-collections/manage-slate.tsx`
- **Props**: `product` (Product or ProductSearch type)
- **Features**:
  - Modal with list of all shared collections
  - Real-time status checking
  - Add/remove functionality with visual feedback
  - Remove button with trash icon for products already in collections
  - Optimistic updates for better UX

### 2. ProductCollectionIndicator Component

- **File**: `frontend/components/admin/shared-collections/product-collection-indicator.tsx`
- **Props**: `product` (Product or ProductSearch type)
- **Features**:
  - Shows count of collections containing the product
  - Only visible to admins
  - Green checkmark indicator

### 3. Updated Hooks

- **File**: `frontend/lib/hooks/useCollection.ts`
- **New Hooks**:
  - `useAddProductToSharedCollection()`
  - `useRemoveProductFromSharedCollection()`

## Integration Points

### Product Cards

- **File**: `frontend/components/store/products/product-card.tsx`
- **Added**: ManageSlate button and ProductCollectionIndicator

### Product Detail Page

- **File**: `frontend/components/store/products/product-view.tsx`
- **Added**: ManageSlate button and ProductCollectionIndicator

### Product Overview Modal

- **File**: `frontend/components/store/products/product-overview.tsx`
- **Added**: ManageSlate button

### Product Search

- **File**: `frontend/components/store/products/product-search.tsx`
- **Added**: ManageSlate button in search results

## User Experience

### For Admin Users

1. **Browse Products**: Admins can browse products normally
2. **Manage Slate**: Click "Manage Slate" button on any product
3. **Select Collection**: Choose from available shared collections
4. **Add or Remove**:
   - Click "Add" button to add products to collections
   - Click "Remove" button (red with trash icon) to remove products from collections
5. **Visual Feedback**: See immediate feedback on collection status
6. **Real-time Updates**: Status updates in real-time without page refresh

## Security

- All new API endpoints require admin authentication
- Frontend components check user role before rendering
- Proper error handling for unauthorized access

## Performance

- Real-time status checking with React Query caching
- Optimistic updates for better UX
- Proper cache invalidation when collections are modified

## Future Enhancements

1. **Bulk Operations**: Add/remove multiple products to collections at once
2. **Collection Management**: Quick collection creation from product pages
3. **Analytics**: Track which collections are most used
4. **Notifications**: Notify when products are added/removed from collections
5. **Search**: Search within collections when adding products
6. **Undo/Redo**: Undo recent add/remove operations
