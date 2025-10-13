"use client";

import dynamic from "next/dynamic";

export const Featured = dynamic(() => import("@/components/store/home/featured"), { ssr: false });
export const Trending = dynamic(() => import("@/components/store/home/trending"), { ssr: false });
export const RecentlyViewedSection = dynamic(() => import("@/components/store/home/recently-viewed"), { ssr: false });
export const NewArrivals = dynamic(() => import("@/components/store/home/arrival"), { ssr: false });
export const ContactSection = dynamic(() => import("@/components/store/landing/contact-section"), { ssr: false });
export const NewsletterSection = dynamic(() => import("@/components/store/landing/newsletter-section"), { ssr: false });
