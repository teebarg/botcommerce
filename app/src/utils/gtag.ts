export type EventType = "page_view" | "product_view" | "add_to_cart" | "checkout" | "purchase";

export interface PageViewEvent {
    page_path: string;
}

export interface ProductViewEvent {
    id: number;
    name: string;
    price: number;
}

export interface AddToCartEvent {
    product_id: string;
    product_name: string;
    quantity: number;
    price: number;
}

export interface CheckoutEvent {
    cart_id: string;
    value: number;
    items: Array<{
        id: number;
        name: string;
        quantity: number;
        price: number;
    }>;
}

export interface PurchaseEvent {
    order_id: string;
    value: number;
    items: Array<{
        id: number;
        name: string;
        quantity: number;
        price: number;
    }>;
}

export const gtag = {
    pageView: (properties: PageViewEvent) => {
        if (!(window as any).gtag || !import.meta.env.PROD) return;

        (window as any).gtag("config", import.meta.env.VITE_GA_ID, {
            page_path: properties.page_path,
        });
    },
    addToCart: (properties: AddToCartEvent) => {
        if (!(window as any).gtag || !import.meta.env.PROD) return;

        (window as any).gtag("event", "add_to_cart", {
            currency: "NGN",
            value: properties.price,
            items: [
                {
                    item_id: properties.product_id,
                    item_name: properties.product_name,
                    price: properties.price,
                    quantity: 1,
                },
            ],
        });
    },
    viewItem: (product: ProductViewEvent) => {
        if (!(window as any).gtag || !import.meta.env.PROD) return;

        (window as any).gtag("event", "view_item", {
            currency: "NGN",
            value: product.price,
            items: [
                {
                    item_id: product.id,
                    item_name: product.name,
                    price: product.price,
                },
            ],
        });
    },
    beginCheckout: (cart: CheckoutEvent) => {
        if (!(window as any).gtag || !import.meta.env.PROD) return;

        (window as any).gtag("event", "begin_checkout", {
            transaction_id: cart.cart_id,
            currency: "NGN",
            value: cart.value,
            items: cart.items.map((item) => ({
                item_id: item.id,
                item_name: item.name,
                price: item.price,
                quantity: item.quantity,
            })),
        });
    },
    purchase: (order: PurchaseEvent) => {
        if (!(window as any).gtag || !import.meta.env.PROD) return;

        // const utm = JSON.parse(localStorage.getItem("utm") || "{}");

        (window as any).gtag("event", "purchase", {
            transaction_id: order.order_id,
            value: order.value,
            currency: "NGN",
            items: order.items.map((item) => ({
                item_id: item.id,
                item_name: item.name,
                price: item.price,
                quantity: item.quantity,
                // item_category: item.category,
            })),
            // campaign: utm.campaign,
            // source: utm.source,
            // medium: utm.medium,
        });
    },
};
