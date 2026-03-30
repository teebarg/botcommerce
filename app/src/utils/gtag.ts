export type EventType = "page_view" | "product_view" | "add_to_cart" | "checkout" | "purchase";

export interface PageViewEvent {
    page: string;
    title: string;
    referrer: string;
}

export interface ProductViewEvent {
    product_id: string;
    product_name: string;
    price: number;
}

export interface AddToCartEvent {
    product_id: string;
    product_name: string;
    quantity: number;
    price: number;
}

export interface CheckoutEvent {
    cart_value: number;
    item_count: number;
}

export interface PurchaseEvent {
    order_id: string;
    order_value: number;
    items: Array<{
        product_id: string;
        quantity: number;
        price: number;
    }>;
}

type EventPayload = PageViewEvent | ProductViewEvent | AddToCartEvent | CheckoutEvent | PurchaseEvent;

export const gtag = {
    addToCart: (properties: AddToCartEvent) => {
        if ((window as any).gtag) {
            (window as any).gtag("event", "add_to_cart", {
                currency: "NGN",
                value: properties.price,
                items: [
                    {
                        item_id: properties.product_id,
                        item_name: properties.product_name,
                        price: properties.price,
                        quantity: 1,
                        // item_category: product.category,
                    },
                ],
            });
        }
    },
    viewItem: (product: { id: number; name: string; price: number; category?: string }) => {
        if (!(window as any).gtag || import.meta.env.PROD) return;

        // const utm = JSON.parse(localStorage.getItem("utm") || "{}");

        (window as any).gtag("event", "view_item", {
            currency: "NGN",
            value: product.price,
            items: [
                {
                    item_id: product.id,
                    item_name: product.name,
                    price: product.price,
                    // item_category: product.category,
                },
            ],
            // campaign: utm.campaign,
            // source: utm.source,
            // medium: utm.medium,
        });
    },
    beginCheckout: (cart: {
        id: string;
        total: number;
        items: {
            id: number;
            name: string;
            price: number;
            // category: string;
            quantity: number;
        }[];
    }) => {
        if (!(window as any).gtag || import.meta.env.PROD) return;

        // const utm = JSON.parse(localStorage.getItem("utm") || "{}");

        (window as any).gtag("event", "begin_checkout", {
            currency: "NGN",
            value: cart.total,
            items: cart.items.map((item) => ({
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
    purchase: (order: {
        id: string;
        total: number;
        items: {
            id: number;
            name: string;
            price: number;
            // category: string;
            quantity: number;
        }[];
    }) => {
        if (!(window as any).gtag || import.meta.env.PROD) return;

        // const utm = JSON.parse(localStorage.getItem("utm") || "{}");

        (window as any).gtag("event", "purchase", {
            transaction_id: order.id,
            value: order.total,
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
