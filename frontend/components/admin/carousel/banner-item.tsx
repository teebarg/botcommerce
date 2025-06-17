"use client";

import React from "react";
import { Edit3, Trash2, Eye, EyeOff, ExternalLink } from "lucide-react";
import { useOverlayTriggerState } from "@react-stately/overlays";
import { toast } from "sonner";

import BannerForm from "./banner-form";
import BannerImageManager from "./banner-image-upload";

import { CarouselBanner } from "@/schemas/carousel";
import Overlay from "@/components/overlay";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Confirm } from "@/components/generic/confirm";
import { api } from "@/apis";
import { useInvalidate } from "@/lib/hooks/useApi";
import { cn, formatDate } from "@/lib/utils";

interface BannerItemProps {
    banner: CarouselBanner;
    onSuccess?: () => void;
}

const BannerItem: React.FC<BannerItemProps> = ({ banner, onSuccess }) => {
    const editState = useOverlayTriggerState({});
    const deleteState = useOverlayTriggerState({});
    const invalidate = useInvalidate();

    // const moveItem = (id: number, direction: "up" | "down") => {
    //     const sortedBanners = [...banners].sort((a, b) => a.order - b.order);
    //     const index = sortedBanners.findIndex((banner) => banner.id === id);

    //     if ((direction === "up" && index > 0) || (direction === "down" && index < sortedBanners.length - 1)) {
    //         const newIndex = direction === "up" ? index - 1 : index + 1;
    //         const updatedBanners = [...sortedBanners];

    //         [updatedBanners[index], updatedBanners[newIndex]] = [updatedBanners[newIndex], updatedBanners[index]];

    //         updatedBanners.forEach((banner, idx) => {
    //             banner.order = idx + 1;
    //             banner.updated_at = new Date().toISOString();
    //         });

    //         setBanners(updatedBanners);
    //     }
    // };

    const handleDelete = async () => {
        try {
            await api.admin.carousel.delete(banner.id);
            toast.success("Banner deleted successfully");
            invalidate("carousel-banners");
        } catch (error) {
            toast.error("Failed to delete banner");
        }
    };

    const handleToggleActive = async () => {
        try {
            await api.admin.carousel.update(banner.id, { is_active: !banner.is_active });
            toast.success("Banner status updated successfully");
            invalidate("carousel-banners");
        } catch (error) {
            toast.error("Failed to update banner status");
        }
    };

    return (
        <div
            key={banner.id}
            className={cn(
                "bg-content1 rounded-2xl shadow-sm border transition-all duration-200 hover:shadow-md",
                banner.is_active ? "border-emerald-100 bg-card-active" : "border-default-200"
            )}
        >
            <div className="p-6">
                <div className="flex flex-col lg:flex-row gap-6">
                    {/* Banner Preview */}
                    <div className="lg:w-80 flex-shrink-0">
                        <div className="relative rounded-xl overflow-hidden bg-gray-100 aspect-[2/1]">
                            {banner.image ? (
                                <img alt={banner.title} className="w-full h-full object-cover" src={banner.image} />
                            ) : (
                                <div className="w-full h-full flex items-center justify-center text-gray-400">
                                    <BannerImageManager bannerId={banner.id} initialImage={banner.image} />
                                </div>
                            )}
                            <div className="absolute top-3 left-3 flex gap-2">
                                <span
                                    className={`px-2 py-1 text-xs font-medium rounded-full ${
                                        banner.is_active ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-600"
                                    }`}
                                >
                                    {banner.is_active ? "Active" : "Inactive"}
                                </span>
                                <span className="px-2 py-1 text-xs font-medium rounded-full bg-blue-100 text-blue-700">#{banner.order}</span>
                            </div>
                        </div>
                    </div>

                    {/* Banner Details */}
                    <div className="flex-1 min-w-0">
                        <div className="flex flex-col h-full">
                            <div className="flex-1">
                                <h3 className="text-xl font-bold text-default-900 mb-2 truncate">{banner.title}</h3>
                                {banner.subtitle && <p className="text-lg text-default-600 mb-2">{banner.subtitle}</p>}
                                {banner.description && <p className="text-default-600 mb-4 line-clamp-2">{banner.description}</p>}
                                <div className="flex flex-wrap gap-4 text-sm text-default-500">
                                    {banner.buttonText && (
                                        <span className="flex items-center gap-1">
                                            <span className="w-2 h-2 bg-blue-400 rounded-full" />
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

                            {/* Actions */}
                            <div className="flex flex-wrap items-center justify-between gap-4 pt-4 border-t border-default-400">
                                <div className="text-xs text-default-500">Updated: {formatDate(banner.updated_at)}</div>
                                <div className="flex items-center gap-2">
                                    {/* Reorder buttons */}
                                    {/* <div className="flex items-center border border-gray-200 rounded-lg">
                                            <button
                                                onClick={() => moveItem(banner.id, "up")}
                                                disabled={index === 0}
                                                className="p-2 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                                            >
                                                <ChevronUp className="w-4 h-4" />
                                            </button>
                                            <button
                                                onClick={() => moveItem(banner.id, "down")}
                                                disabled={index === sortedBanners.length - 1}
                                                className="p-2 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                                            >
                                                <ChevronDown className="w-4 h-4" />
                                            </button>
                                        </div> */}

                                    <Button
                                        className={cn(banner.is_active && "text-green-600 hover:bg-green-50")}
                                        size="icon"
                                        variant="ghost"
                                        onClick={handleToggleActive}
                                    >
                                        {banner.is_active ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
                                    </Button>

                                    <Overlay
                                        open={editState.isOpen}
                                        title="Edit Banner"
                                        trigger={
                                            <Button size="icon" variant="ghost">
                                                <Edit3 className="w-4 h-4 text-blue-600" />
                                            </Button>
                                        }
                                        onOpenChange={editState.setOpen}
                                    >
                                        <BannerForm banner={banner} onClose={editState.close} onSuccess={onSuccess} />
                                    </Overlay>

                                    <Dialog open={deleteState.isOpen} onOpenChange={deleteState.setOpen}>
                                        <DialogTrigger asChild>
                                            <Button size="icon" variant="ghost">
                                                <Trash2 className="w-4 h-4 text-red-600" />
                                            </Button>
                                        </DialogTrigger>
                                        <DialogContent>
                                            <DialogHeader>
                                                <DialogTitle className="sr-only">Delete</DialogTitle>
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
