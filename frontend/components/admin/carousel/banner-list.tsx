import { useState } from "react";
import { CarouselBanner } from "@/schemas/carousel";
import { Button } from "@/components/ui/button";
import { Plus, Upload } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { api } from "@/apis";
import { toast } from "sonner";
import BannerForm from "./banner-form";
import BannerItem from "./banner-item";

interface CarouselBannerListProps {
    initialBanners: CarouselBanner[];
}

export default function CarouselBannerList({ initialBanners }: CarouselBannerListProps) {
    const [isFormOpen, setIsFormOpen] = useState(false);
    const [selectedBanner, setSelectedBanner] = useState<CarouselBanner | null>(null);

    const { data: banners, refetch } = useQuery({
        queryKey: ["carousel-banners"],
        queryFn: async () => {
            const { data } = await api.admin.carousel.list();
            return data;
        },
        initialData: initialBanners,
    });

    const handleEdit = (banner: CarouselBanner) => {
        setSelectedBanner(banner);
        setIsFormOpen(true);
    };

    const handleDelete = async (id: number) => {
        try {
            await api.admin.carousel.delete(id);
            toast.success("Banner deleted successfully");
            refetch();
        } catch (error) {
            toast.error("Failed to delete banner");
        }
    };

    const handleToggleActive = async (id: number, is_active: boolean) => {
        try {
            await api.admin.carousel.update(id, { is_active: !is_active });
            toast.success("Banner status updated successfully");
            refetch();
        } catch (error) {
            toast.error("Failed to update banner status");
        }
    };

    return (
        <div>
            <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 mb-6">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900 mb-2">Banner Management</h1>
                        <p className="text-gray-600">Manage your homepage carousel banners</p>
                    </div>
                    <Button variant="primary" size="lg">
                        <Plus className="w-5 h-5" />
                        Add Banner
                    </Button>
                </div>
            </div>

            <div className="space-y-4">
                {banners?.map((banner: CarouselBanner, index) => (
                    <BannerItem
                        key={banner.id}
                        banner={banner}
                        onEdit={() => handleEdit(banner)}
                        onDelete={() => handleDelete(banner.id)}
                        onToggleActive={(is_active) => handleToggleActive(banner.id, is_active)}
                    />
                ))}

                {banners?.length === 0 && (
                    <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-12 text-center">
                        <div className="text-gray-400 mb-4">
                            <Upload className="w-12 h-12 mx-auto" />
                        </div>
                        <h3 className="text-lg font-medium text-gray-900 mb-2">No banners yet</h3>
                        <p className="text-gray-600 mb-6">Create your first banner to get started</p>
                        <Button variant="primary" size="lg">
                            <Plus className="w-5 h-5" />
                            Add Banner
                        </Button>
                    </div>
                )}
            </div>

            <BannerForm
                open={isFormOpen}
                onOpenChange={setIsFormOpen}
                banner={selectedBanner}
                onSuccess={() => {
                    setIsFormOpen(false);
                    setSelectedBanner(null);
                    refetch();
                }}
            />
        </div>
    );
}
