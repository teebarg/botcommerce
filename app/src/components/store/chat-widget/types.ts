export interface OrderItem {
  product_id: number;
  name: string;
  image?: string;
  quantity: number;
  price: number;
  subtotal: number;
}

export interface OrderFinancials {
  subtotal: number;
  tax: number;
  discount: number;
  wallet_used: number;
  shipping_fee: number;
  total: number;
}

export interface OrderPayload {
  order_number: string;
  status: string;
  payment_status: string;
  payment_method?: string;
  shipping_method?: string;
  financials: OrderFinancials;
  items: OrderItem[];
  created_at: string; // ISO string
}

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
    order?: OrderPayload;
    quick_replies?: string[];
    form?: any;
    reaction?: "thumbs-up" | "thumbs-down" | null;
    replies_used?: boolean; // true once a quick reply is clicked — hides buttons
}

export interface ChatResponse {
    reply: string;
    session_id: string;
    sources: string[];
    escalated: boolean;
    products: Product[];
    order?: any;
    quick_replies?: string[];
    form?: any;
    reaction?: "thumbs-up" | "thumbs-down" | null;
    timestamp: Date;
}
