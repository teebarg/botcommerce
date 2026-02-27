export interface OrderInfo {
    orderId: string;
    status: "processing" | "shipped" | "delivered" | "returned";
    items: string[];
    total: number;
    estimatedDelivery?: string;
    trackingUrl?: string;
}

export interface Product {
    name: string;
    sku: string;
    price: string;
    description: string;
    image_url: string | null;
}

export interface ChatMessage {
    id: string;
    role: "agent" | "user";
    text: string;
    timestamp: Date;
    sources?: string[];
    escalated?: boolean;
    products?: Product[];
    quick_replies?: string[];
    reaction?: "thumbs-up" | "thumbs-down" | null;
    replies_used?: boolean; // true once a quick reply is clicked — hides buttons
}

export interface ChatResponse {
    reply: string;
    session_id: string;
    sources: string[];
    escalated: boolean;
    products: Product[];
    quick_replies?: string[];
    reaction?: "thumbs-up" | "thumbs-down" | null;
    timestamp: Date;
}
