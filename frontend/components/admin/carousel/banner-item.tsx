import React, { useState } from "react";
import { Plus, Edit3, Trash2, GripVertical, Eye, EyeOff, Save, X, Upload, ExternalLink, ChevronUp, ChevronDown } from "lucide-react";
import { CarouselBanner } from "@/schemas/carousel";

interface BannerItemProps {
    banner: CarouselBanner;
    onEdit: (banner: CarouselBanner) => void;
    onDelete: (id: number) => void;
    onToggleActive: (is_active: boolean) => void;
}

const BannerItem: React.FC<BannerItemProps> = ({ banner, onEdit, onDelete, onToggleActive }) => {
    const toggleActive = () => {
        onToggleActive(!banner.is_active);
        // setBanners(
        //     banners.map((banner) => (banner.id === id ? { ...banner, is_active: !banner.is_active, updated_at: new Date().toISOString() } : banner))
        // );
    };

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

    return (
        <React.Fragment>
            <div
                key={banner.id}
                className={`bg-white rounded-2xl shadow-sm border-2 transition-all duration-200 hover:shadow-md ${
                    banner.is_active
                        ? "border-green-200 bg-gradient-to-r from-green-50/50 to-white"
                        : "border-gray-200 bg-gradient-to-r from-gray-50/50 to-white"
                }`}
            >
                <div className="p-6">
                    <div className="flex flex-col lg:flex-row gap-6">
                        {/* Banner Preview */}
                        <div className="lg:w-80 flex-shrink-0">
                            <div className="relative rounded-xl overflow-hidden bg-gray-100 aspect-[2/1]">
                                {banner.image ? (
                                    <img src={banner.image} alt={banner.title} className="w-full h-full object-cover" />
                                ) : (
                                    <div className="w-full h-full flex items-center justify-center text-gray-400">
                                        <Upload className="w-8 h-8" />
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
                                    <h3 className="text-xl font-bold text-gray-900 mb-2 truncate">{banner.title}</h3>
                                    {banner.subtitle && <p className="text-lg text-gray-600 mb-2">{banner.subtitle}</p>}
                                    {banner.description && <p className="text-gray-600 mb-4 line-clamp-2">{banner.description}</p>}
                                    <div className="flex flex-wrap gap-4 text-sm text-gray-500">
                                        {banner.buttonText && (
                                            <span className="flex items-center gap-1">
                                                <span className="w-2 h-2 bg-blue-400 rounded-full"></span>
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
                                <div className="flex flex-wrap items-center justify-between gap-4 pt-4 border-t border-gray-100">
                                    <div className="text-xs text-gray-400">Updated: {new Date(banner.updated_at).toLocaleDateString()}</div>
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

                                        {/* Toggle active */}
                                        <button
                                            onClick={() => toggleActive()}
                                            className={`p-2 rounded-lg transition-colors ${
                                                banner.is_active ? "text-green-600 hover:bg-green-50" : "text-gray-400 hover:bg-gray-50"
                                            }`}
                                        >
                                            {banner.is_active ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
                                        </button>

                                        {/* Edit */}
                                        <button className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors">
                                            <Edit3 className="w-4 h-4" />
                                        </button>

                                        {/* Delete */}
                                        <button
                                            onClick={() => onDelete(banner.id)}
                                            className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                                        >
                                            <Trash2 className="w-4 h-4" />
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </React.Fragment>
    );
};

export default BannerItem;
