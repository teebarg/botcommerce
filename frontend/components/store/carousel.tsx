"use client";

import React from "react";
import Image from "next/image";

import { CarouselBanner } from "@/schemas/carousel";
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from "@/components/ui/carousel";
import { BtnLink } from "@/components/ui/btnLink";
import ClientOnly from "@/components/generic/client-only";
import { useCarouselBannerActive } from "@/lib/hooks/useCarousel";
import ComponentLoader from "@/components/component-loader";

const CarouselSection: React.FC = () => {
    const { data, isLoading, error } = useCarouselBannerActive();

    if (isLoading) {
        return <ComponentLoader className="h-[60vh]" />;
    }

    const banners = data;

    if (error || banners?.length === 0) {
        return null;
    }

    return (
        <ClientOnly>
            <Carousel className="w-full">
                <CarouselContent>
                    {banners?.map((banner: CarouselBanner, idx: number) => (
                        <CarouselItem key={idx}>
                            <div className="relative h-[calc(100vh-4rem)] w-full">
                                <Image
                                    fill
                                    priority
                                    alt={banner.title}
                                    blurDataURL="/placeholder.jpg"
                                    className="object-cover w-full h-full"
                                    placeholder="blur"
                                    sizes="100vw"
                                    src={banner.image || "/placeholder.jpg"}
                                />

                                <div className="absolute inset-0 bg-gradient-to-r from-black/50 to-transparent flex items-center">
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
