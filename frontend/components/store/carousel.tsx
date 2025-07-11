"use client";

import React from "react";

import { CarouselBanner } from "@/schemas/carousel";
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from "@/components/ui/carousel";
import { BtnLink } from "@/components/ui/btnLink";
import ClientOnly from "@/components/generic/client-only";
import { useCarouselBanners } from "@/lib/hooks/useCarousel";
import ComponentLoader from "@/components/component-loader";

const CarouselSection: React.FC = () => {
    const { data, isLoading, error } = useCarouselBanners();

    if (isLoading) {
        return <ComponentLoader className="h-[60vh]" />;
    }

    const banners = data;

    if (error) {
        return;
    }

    return (
        <ClientOnly>
            <Carousel className="w-full">
                <CarouselContent>
                    {banners?.map((banner: CarouselBanner, idx: number) => (
                        <CarouselItem key={idx}>
                            <div className="relative h-[60vh] w-full">
                                <img alt={banner.title} className="object-cover w-full h-full" src={banner.image || "/placeholder.jpg"} />
                                <div className="absolute inset-0 bg-linear-to-r from-black/50 to-transparent flex items-center">
                                    <div className="container mx-auto px-4 md:px-8 lg:px-12">
                                        <div className="max-w-xl text-white">
                                            {banner.subtitle && <h2 className="text-xl md:text-2xl font-medium mb-2">{banner.subtitle}</h2>}
                                            {banner.title && <h1 className="text-3xl md:text-5xl font-bold mb-4">{banner.title}</h1>}
                                            {banner.description && <p className="text-lg mb-6 text-white/80">{banner.description}</p>}
                                            {banner.link && (
                                                <BtnLink href={banner.link} size="lg" variant="primary">
                                                    {banner.buttonText || "Shop Now"}
                                                </BtnLink>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </CarouselItem>
                    ))}
                </CarouselContent>
                <CarouselPrevious className="left-4" />
                <CarouselNext className="right-4" />
            </Carousel>
        </ClientOnly>
    );
};

export default CarouselSection;
