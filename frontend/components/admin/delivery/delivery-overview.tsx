"use client";

import { Plus } from "nui-react-icons";
import { toast } from "sonner";
import { Edit2, LucideProps, Package, Trash2, Truck, Zap } from "lucide-react";
import { useOverlayTriggerState } from "@react-stately/overlays";

import DeliveryOptionForm from "./delivery-option-form";

import { Button } from "@/components/ui/button";
import { DeliveryOption } from "@/schemas";
import { api } from "@/apis/base";
import { useAdminDeliveryOptions } from "@/lib/hooks/useApi";
import { useInvalidate } from "@/lib/hooks/useApi";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Confirm } from "@/components/generic/confirm";
import { Badge } from "@/components/ui/badge";
import { currency } from "@/lib/utils";

const DeliveryOverview: React.FC = () => {
    const addState = useOverlayTriggerState({});
    const editState = useOverlayTriggerState({});
    const deleteState = useOverlayTriggerState({});
    const invalidate = useInvalidate();

    const { data: deliveryOptions } = useAdminDeliveryOptions();

    const getIcon = (iconName: string) => {
        const iconMap: Record<string, React.FC<LucideProps>> = {
            STANDARD: Truck,
            EXPRESS: Zap,
            PICKUP: Package,
        };
        const IconComponent = iconMap[iconName] || Package;

        return <IconComponent className="w-5 h-5" />;
    };

    const handleDelete = async (id: number) => {
        const response = await api.delete<DeliveryOption>(`/delivery/${id}`);

        if (!response.error) {
            toast.success("Delivery option deleted successfully");
            invalidate("all-delivery");
            invalidate("available-delivery");
        }
    };

    return (
        <div className="container mx-auto py-6">
            <div className="flex flex-row items-center justify-between py-2">
                <h3 className="text-lg font-semibold">Delivery Options</h3>
                <Dialog open={addState.isOpen} onOpenChange={addState.setOpen}>
                    <DialogTrigger asChild>
                        <Button size="lg" variant="primary">
                            <Plus className="mr-2 h-4 w-4" />
                            Add Option
                        </Button>
                    </DialogTrigger>
                    <DialogContent>
                        <DialogHeader className="sr-only">
                            <DialogTitle>Add Delivery Option</DialogTitle>
                        </DialogHeader>
                        <DeliveryOptionForm onClose={addState.close} />
                    </DialogContent>
                </Dialog>
            </div>

            <div className="space-y-4">
                {deliveryOptions?.map((option: DeliveryOption, idx: number) => (
                    <div key={idx} className="bg-card rounded-2xl shadow-lg border border-default-200 overflow-hidden">
                        <div className="p-6">
                            <div className="flex items-start justify-between">
                                <div className="flex items-start gap-4 flex-1">
                                    <div className={`p-3 rounded-xl ${option.is_active ? "bg-blue-100" : "bg-gray-100"}`}>
                                        <div className={option.is_active ? "text-blue-600" : "text-gray-400"}>{getIcon(option.method)}</div>
                                    </div>

                                    <div className="flex-1">
                                        <div className="flex items-center gap-3">
                                            <h3 className="text-lg font-bold text-default-800">{option.name}</h3>
                                            <Badge variant={option.is_active ? "emerald" : "destructive"}>
                                                {option.is_active ? "Active" : "Inactive"}
                                            </Badge>
                                        </div>

                                        <p className="text-default-500 mb-2">{option.description}</p>

                                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                            <div className="flex items-center gap-2 text-sm">
                                                <span className="font-medium text-green-600">{currency(option.amount)}</span>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                <div className="flex items-center gap-2 ml-4">
                                    <Dialog open={editState.isOpen} onOpenChange={editState.setOpen}>
                                        <DialogTrigger asChild>
                                            <Button className="p-2 text-blue-600 bg-blue-50 hover:bg-blue-100" size="icon">
                                                <Edit2 className="w-4 h-4" />
                                            </Button>
                                        </DialogTrigger>
                                        <DialogContent>
                                            <DialogHeader className="sr-only">
                                                <DialogTitle>Edit Delivery Option</DialogTitle>
                                            </DialogHeader>
                                            <DeliveryOptionForm initialData={option} onClose={editState.close} />
                                        </DialogContent>
                                    </Dialog>
                                    <Dialog open={deleteState.isOpen} onOpenChange={deleteState.setOpen}>
                                        <DialogTrigger asChild>
                                            <Button className="p-2 text-red-600 bg-red-50 hover:bg-red-100" size="icon">
                                                <Trash2 className="w-4 h-4" />
                                            </Button>
                                        </DialogTrigger>
                                        <DialogContent>
                                            <DialogHeader>
                                                <DialogTitle className="sr-only">Delete</DialogTitle>
                                            </DialogHeader>
                                            <Confirm onClose={deleteState.close} onConfirm={() => handleDelete(option.id)} />
                                        </DialogContent>
                                    </Dialog>
                                </div>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default DeliveryOverview;
