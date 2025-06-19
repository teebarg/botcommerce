import { Metadata } from "next";

import { api } from "@/apis";
import CarouselBannerList from "@/components/admin/carousel/banner-list";

export const metadata: Metadata = {
    title: "Carousel Banners",
    description: "Manage carousel banners",
};

export default async function CarouselBannersPage() {
    const { data: banners } = await api.admin.carousel.list();

    return (
        <div className="container mx-auto px-4 py-8">
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-2xl font-bold">Carousel Banners</h1>
            </div>
            <CarouselBannerList initialBanners={banners!} />
        </div>
    );
}
