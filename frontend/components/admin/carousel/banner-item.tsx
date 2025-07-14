"use client";

import React from "react";
import { Edit3, Trash2, Eye, EyeOff, ExternalLink, Edit2 } from "lucide-react";
import { useOverlayTriggerState } from "@react-stately/overlays";

import BannerForm from "./banner-form";
import BannerImageManager from "./banner-image-upload";

import { CarouselBanner } from "@/schemas/carousel";
import Overlay from "@/components/overlay";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Confirm } from "@/components/generic/confirm";
import { cn, formatDate } from "@/lib/utils";
import { useDeleteCarouselBanner, useUpdateCarouselBanner } from "@/lib/hooks/useCarousel";

interface BannerItemProps {
    banner: CarouselBanner;
}

const BannerItem: React.FC<BannerItemProps> = ({ banner }) => {
    const editState = useOverlayTriggerState({});
    const deleteState = useOverlayTriggerState({});
    const updateImageState = useOverlayTriggerState({});
    const deleteBanner = useDeleteCarouselBanner();
    const updateBanner = useUpdateCarouselBanner();

    const handleDelete = async () => {
        await deleteBanner.mutateAsync(banner.id);
    };

    const handleUpdate = async () => {
        await updateBanner.mutateAsync({ id: banner.id, data: { is_active: !banner.is_active } });
    };

    return (
        <div
            key={banner.id}
            className={cn(
                "bg-content1 rounded-2xl shadow-sm transition-all duration-200 hover:shadow-md",
                banner.is_active ? "bg-emerald-100 dark:bg-emerald-700 text-default-800" : ""
            )}
        >
            <div className="p-6">
                <div className="flex flex-col lg:flex-row gap-6">
                    <div className="lg:w-80 flex-shrink-0">
                        <div className="relative rounded-xl overflow-hidden bg-default-200 aspect-[2/1]">
                            {banner.image ? (
                                <>
                                    <img alt={banner.title} className="w-full h-full object-cover" src={banner.image} />
                                    <Dialog open={updateImageState.isOpen} onOpenChange={updateImageState.setOpen}>
                                        <DialogTrigger asChild>
                                            <Button className="absolute top-2 right-2" size="icon" variant="ghost">
                                                <Edit2 className="w-4 h-4 text-red-600" />
                                            </Button>
                                        </DialogTrigger>
                                        <DialogContent>
                                            <DialogHeader className="sr-only">
                                                <DialogTitle>Edit Banner Image</DialogTitle>
                                            </DialogHeader>
                                            <BannerImageManager bannerId={banner.id} onClose={updateImageState.close} />
                                        </DialogContent>
                                    </Dialog>
                                </>
                            ) : (
                                <div className="w-full h-full flex items-center justify-center text-gray-400">
                                    <BannerImageManager bannerId={banner.id} />
                                </div>
                            )}
                            <div className="absolute top-3 left-3 flex gap-2">
                                <span className="px-2 py-1 text-xs font-medium rounded-full bg-blue-100 text-blue-700">#{banner.order}</span>
                            </div>
                        </div>
                    </div>

                    <div className="flex-1 min-w-0">
                        <div className="flex flex-col h-full">
                            <div className="flex-1">
                                <h3 className="text-xl font-bold text-default-900 truncate">{banner.title}</h3>
                                {banner.subtitle && <p className="text-lg text-default-700">{banner.subtitle}</p>}
                                {banner.description && <p className="text-default-700 line-clamp-2 mb-4">{banner.description}</p>}
                                <div className="flex flex-wrap gap-4 text-sm text-default-700">
                                    {banner.buttonText && (
                                        <span className="flex items-center gap-1">
                                            <span className="w-2 h-2 bg-blue-800 rounded-full" />
                                            Button: {banner.buttonText}
                                        </span>
                                    )}
                                    {banner.link && (
                                        <span className="flex items-center gap-1">
                                            <ExternalLink className="w-3 h-3" />
                                            {banner.link}
                                        </span>
                                    )}
                                </div>
                            </div>

                            <div className="flex flex-wrap items-center justify-between gap-4 pt-4 border-t border-default-400">
                                <div className={cn("text-xs text-default-500", banner.is_active && "dark:text-green-50 text-green-500")}>
                                    Updated: {formatDate(banner.updated_at)}
                                </div>
                                <div className="flex items-center">
                                    <Button
                                        className={cn(banner.is_active && "text-green-600 hover:bg-green-50")}
                                        size="icon"
                                        variant="ghost"
                                        onClick={handleUpdate}
                                    >
                                        {banner.is_active ? <Eye className="w-5 h-5" /> : <EyeOff className="w-5 h-5" />}
                                    </Button>

                                    <Overlay
                                        open={editState.isOpen}
                                        title="Edit Banner"
                                        trigger={
                                            <Button size="icon" variant="ghost">
                                                <Edit3 className="w-5 h-5 text-blue-600" />
                                            </Button>
                                        }
                                        onOpenChange={editState.setOpen}
                                    >
                                        <BannerForm banner={banner} onClose={editState.close} />
                                    </Overlay>

                                    <Dialog open={deleteState.isOpen} onOpenChange={deleteState.setOpen}>
                                        <DialogTrigger asChild>
                                            <Button size="icon" variant="ghost">
                                                <Trash2 className="w-5 h-5 text-red-600" />
                                            </Button>
                                        </DialogTrigger>
                                        <DialogContent>
                                            <DialogHeader className="sr-only">
                                                <DialogTitle>Delete</DialogTitle>
                                            </DialogHeader>
                                            <Confirm onClose={deleteState.close} onConfirm={handleDelete} />
                                        </DialogContent>
                                    </Dialog>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default BannerItem;
