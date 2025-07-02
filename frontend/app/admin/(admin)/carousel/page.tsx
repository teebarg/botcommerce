import { Metadata } from "next";

import CarouselBannerList from "@/components/admin/carousel/banner-list";

export const metadata: Metadata = {
    title: "Carousel Banners",
    description: "Manage carousel banners",
};

export default async function CarouselBannersPage() {
    return (
        <div className="container mx-auto px-4 py-8">
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-2xl font-bold">Carousel Banners</h1>
            </div>
            <CarouselBannerList />
        </div>
    );
}
