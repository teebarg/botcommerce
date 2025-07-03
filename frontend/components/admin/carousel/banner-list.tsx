"use client";

import { Plus, Upload } from "lucide-react";
import { useOverlayTriggerState } from "@react-stately/overlays";

import BannerForm from "./banner-form";
import BannerItem from "./banner-item";

import { Button } from "@/components/ui/button";
import { CarouselBanner } from "@/schemas/carousel";
import Overlay from "@/components/overlay";
import ClientOnly from "@/components/generic/client-only";
import { useCarouselBanners } from "@/lib/hooks/useCarousel";
import ComponentLoader from "@/components/component-loader";

export default function CarouselBannerList() {
    const addState = useOverlayTriggerState({});

    const { data: banners, isLoading } = useCarouselBanners();

    return (
        <ClientOnly>
            <div className="bg-card rounded-2xl shadow-sm border border-default-100 p-6 mb-6">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div>
                        <h1 className="text-2xl font-bold text-default-900">Banner Management</h1>
                        <p className="text-default-600">Manage your homepage carousel banners</p>
                    </div>
                    <Overlay
                        open={addState.isOpen}
                        title="Add Banner"
                        trigger={
                            <Button size="lg" variant="primary">
                                <Plus className="w-5 h-5" />
                                Add Banner
                            </Button>
                        }
                        onOpenChange={addState.setOpen}
                    >
                        <BannerForm onClose={addState.close} />
                    </Overlay>
                </div>
            </div>

            <div className="space-y-4">
                {banners && banners?.map((banner: CarouselBanner, idx: number) => <BannerItem key={idx} banner={banner} />)}
                {isLoading && <ComponentLoader className="h-[200px]" />}
                {!isLoading && banners?.length === 0 && (
                    <div className="bg-card rounded-2xl shadow-sm border border-default-200 p-12 text-center">
                        <div className="text-default-400 mb-4">
                            <Upload className="w-12 h-12 mx-auto" />
                        </div>
                        <h3 className="text-lg font-medium text-default-900 mb-2">No banners yet</h3>
                        <p className="text-default-600 mb-6">Create your first banner to get started</p>
                    </div>
                )}
            </div>
        </ClientOnly>
    );
}
