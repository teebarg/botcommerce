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

let initialized = false;

export function initPulseMetrics() {
    if (typeof window === "undefined") return;
    if (!window.PulseMetrics) return;
    if (initialized) return;

    window.PulseMetrics.init({
        apiKey: import.meta.env.VITE_PULSE_KEY,
    });

    initialized = true;
}

export const trackEvent = (eventType: EventType, properties: EventPayload) => {
    if (typeof window === "undefined") return;
    if (!window.PulseMetrics) return;

    window.PulseMetrics.track(eventType, properties);
};

export const analytics = {
    pageView: (href: string) => {
        trackEvent("page_view", {
            page: href,
            title: document.title,
            referrer: document.referrer,
        });
    },

    productView: (properties: ProductViewEvent) => {
        trackEvent("product_view", properties);
    },

    addToCart: (properties: AddToCartEvent) => {
        trackEvent("add_to_cart", properties);
    },

    checkout: (properties: CheckoutEvent) => {
        trackEvent("checkout", properties);
    },

    purchase: (properties: PurchaseEvent) => {
        trackEvent("purchase", properties);
    },
};
