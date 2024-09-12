

export type Product = {
    id: number;
    name: string;
    slug?: string;
    description?: string;
    price: number;
    old_price: number;
    image: string;
    is_active?: boolean;
    ratings?: number;
};

export type FeaturedProduct = {
    id: string;
    title: string;
    handle: string;
    thumbnail?: string;
};

export type ProductPreviewType = {
    id: string;
    title: string;
    handle: string | null;
    thumbnail: string | null;
    created_at?: Date;
    price?: {
        calculated_price: string;
        original_price: string;
        difference: string;
        price_type: "default" | "sale";
    };
    isFeatured?: boolean;
};

export type ProductCollectionWithPreviews = Omit<any, "products"> & {
    products: ProductPreviewType[];
};

export type InfiniteProductPage = {
    response: {
        products: any[];
        count: number;
    };
};

export type ProductVariantInfo = Pick<any, "prices">;

export type RegionInfo = Pick<any, "currency_code" | "tax_code" | "tax_rate">;

export type CartWithCheckoutStep = Omit<any, "beforeInsert" | "beforeUpdate" | "afterUpdateOrLoad"> & {
    checkout_step: "address" | "delivery" | "payment";
};

export type ProductCategoryWithChildren = Omit<any, "category_children"> & {
    category_children: any[];
    category_parent?: any;
};
