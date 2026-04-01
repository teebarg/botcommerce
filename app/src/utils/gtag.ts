const send = (event: string, params: Record<string, unknown>) => {
    if (typeof window === "undefined") return;
    if (!(window as any).gtag) return;
    if (!import.meta.env.PROD) return;
    (window as any).gtag("event", event, params);
};

export interface GtagItem {
    item_id: string | number;
    item_name: string;
    price: number;
    quantity?: number;
    item_category?: string;
    item_brand?: string;
    item_variant?: string;
}

export interface PageViewEvent {
    page_path: string;
}

export interface ProductViewEvent {
    id: string | number;
    name: string;
    price: number;
    category?: string;
}

export interface AddToCartEvent {
    product_id: string | number;
    product_name: string;
    quantity: number;
    price: number;
    category?: string;
}

export interface CartEvent {
    items: Array<{
        id: string | number;
        name: string;
        quantity: number;
        price: number;
        category?: string;
    }>;
}

export interface CheckoutEvent {
    cart_id: string;
    value: number;
    items: CartEvent["items"];
}

export interface PurchaseEvent {
    order_id: string;
    value: number;
    tax?: number;
    shipping?: number;
    coupon?: string;
    items: CartEvent["items"];
}

const toGtagItem = (item: {
    id: string | number;
    name: string;
    price: number;
    quantity?: number;
    category?: string;
    variant?: string;
}): GtagItem => ({
    item_id: item.id,
    item_name: item.name,
    price: item.price,
    ...(item.quantity !== undefined && { quantity: item.quantity }),
    ...(item.category && { item_category: item.category }),
    ...(item.variant && { item_variant: item.variant }),
});

export const gtag = {
    pageView: (properties: PageViewEvent) => {
        if (typeof window === "undefined") return;
        if (!(window as any).gtag) return;
        if (!import.meta.env.PROD) return;
        (window as any).gtag("config", import.meta.env.VITE_GA_ID, {
            page_path: properties.page_path,
        });
    },

    viewItem: (product: ProductViewEvent) => {
        send("view_item", {
            currency: "NGN",
            value: product.price,
            items: [toGtagItem({ id: product.id, name: product.name, price: product.price, category: product.category })],
        });
    },

    addToCart: (properties: AddToCartEvent) => {
        send("add_to_cart", {
            currency: "NGN",
            value: properties.price * properties.quantity,
            items: [
                toGtagItem({
                    id: properties.product_id,
                    name: properties.product_name,
                    price: properties.price,
                    quantity: properties.quantity,
                    category: properties.category,
                }),
            ],
        });
    },

    beginCheckout: (cart: CheckoutEvent) => {
        send("begin_checkout", {
            currency: "NGN",
            value: cart.value,
            items: cart.items.map(toGtagItem),
        });
    },

    purchase: (order: PurchaseEvent) => {
        send("purchase", {
            transaction_id: order.order_id,
            currency: "NGN",
            value: order.value,
            ...(order.tax !== undefined && { tax: order.tax }),
            ...(order.shipping !== undefined && { shipping: order.shipping }),
            ...(order.coupon && { coupon: order.coupon }),
            items: order.items.map(toGtagItem),
        });
    },
};
