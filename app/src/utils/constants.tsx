import { Building, CreditCard, ShoppingBag } from "lucide-react";
import type { JSX } from "react";

export const paymentInfoMap: Record<string, { title: string; description: string; icon: JSX.Element | any }> = {
    PAYSTACK: {
        title: "Paystack",
        description: "Fast and secure payments",
        icon: <CreditCard size={20} />,
    },
    BANK_TRANSFER: {
        title: "Bank Transfer",
        description: "Make a direct bank transfer.",
        icon: <Building size={20} />,
    },
    CREDIT_CARD: {
        title: "Debit Card",
        description: "Checkout securely with your Debit card",
        icon: <CreditCard size={20} />,
    },
    CASH_ON_DELIVERY: {
        title: "Pay at Pickup",
        description: "Pay when you pick up your order",
        icon: <ShoppingBag size={20} />,
    },
};

export const SIZE_OPTIONS = ["6", "8", "10", "12", "14", "16", "18", "20", "22", "24"];
export const COLOR_OPTIONS = [
    "Red",
    "Blue",
    "Green",
    "Black",
    "White",
    "Gray",
    "Yellow",
    "Purple",
    "Orange",
    "Pink",
    "Brown",
    "Magenta",
    "Indigo",
    "Wine",
];
export const AGE_OPTIONS = [
    "0-6 months",
    "6-12 months",
    "1-2 years",
    "2-3 years",
    "3-4 years",
    "4-5 years",
    "5-6 years",
    "6-7 years",
    "7-8 years",
    "8-9 years",
    "9-10 years",
    "10-12 years",
    "12+ years",
];

export const HERO_IMAGES = [
  "https://res.cloudinary.com/dj7ubhgys/image/upload/v1769793694/h5_t5dv1x.jpg",
  "https://res.cloudinary.com/dj7ubhgys/image/upload/v1769793694/h4_tu4ham.jpg",
  "https://res.cloudinary.com/dj7ubhgys/image/upload/v1769793694/h3_ydbkmz.jpg",
  "https://res.cloudinary.com/dj7ubhgys/image/upload/v1769793694/h2_tfzcyr.jpg",
  "https://res.cloudinary.com/dj7ubhgys/image/upload/v1769793694/h1_zaixjo.jpg",
];

