import { Product } from "@/schemas";

export type MessageRole = "user" | "agent" | "system";

export type MessageContentType = 
  | "text" 
  | "order-card" 
  | "product-card" 
  | "quick-replies" 
  | "escalation"
  | "file";

export interface OrderInfo {
  orderId: string;
  status: "processing" | "shipped" | "delivered" | "returned";
  items: string[];
  total: number;
  estimatedDelivery?: string;
  trackingUrl?: string;
}

export interface ChatMessage {
  id: string;
  role: MessageRole;
  content: string;
  contentType: MessageContentType;
  timestamp: Date;
  order?: OrderInfo;
  products?: Product[];
  quickReplies?: string[];
  fileName?: string;
  fileUrl?: string;
  reaction?: "thumbs-up" | "thumbs-down" | null;
}
