import { Plus } from "lucide-react";
import { toast } from "sonner";
import { Clock, type LucideProps, Package, Pencil, Trash2, Truck, Zap } from "lucide-react";
import { useOverlayTriggerState } from "react-stately";
import DeliveryOptionForm from "./delivery-option-form";
import { Button } from "@/components/ui/button";
import type { DeliveryOption, Message } from "@/schemas";
import { useAdminDeliveryOptions } from "@/hooks/useApi";
import { useInvalidate } from "@/hooks/useApi";
import { Badge } from "@/components/ui/badge";
import { currency } from "@/utils";
import ServerError from "@/components/generic/server-error";
import { tryCatch } from "@/utils/try-catch";
import ComponentLoader from "@/components/component-loader";
import { ZeroState } from "@/components/zero";
import { deleteDeliveryFn } from "@/server/generic.server";
import SheetDrawer from "@/components/sheet-drawer";
import { ConfirmDrawer } from "@/components/generic/confirm-drawer";
import { useState } from "react";

const DeliveryItem: React.FC<{ option: DeliveryOption }> = ({ option }) => {
    const editState = useOverlayTriggerState({});
    const deleteState = useOverlayTriggerState({});
    const invalidate = useInvalidate();
    const [isPending, setIsPending] = useState<boolean>(false);

    const getIcon = (iconName: string) => {
        const iconMap: Record<string, React.FC<LucideProps>> = {
            STANDARD: Truck,
            EXPRESS: Zap,
            PICKUP: Package,
        };
        const IconComponent = iconMap[iconName] || Package;

        return <IconComponent className="w-5 h-5" />;
    };

    const handleDelete = async () => {
        setIsPending(true);
        const { error } = await tryCatch<Message>(deleteDeliveryFn({ data: option.id }));

        if (!error) {
            toast.success("Delivery option deleted successfully");
            invalidate("delivery");
            deleteState.close();
        }
        setIsPending(false);
    };

    return (
        <div className="bg-card rounded-2xl shadow-lg border border-border overflow-hidden">
            <div className="p-6">
                <div className="flex items-start justify-between">
                    <div className="flex items-start gap-4 flex-1">
                        <div className={`p-3 rounded-xl ${option.is_active ? "bg-blue-100" : "bg-gray-100"}`}>
                            <div className={option.is_active ? "text-blue-600" : "text-gray-400"}>{getIcon(option.method)}</div>
                        </div>

                        <div className="flex-1">
                            <div className="flex items-center gap-3">
                                <h3 className="text-lg font-bold">{option.name}</h3>
                                <Badge variant={option.is_active ? "emerald" : "destructive"}>{option.is_active ? "Active" : "Inactive"}</Badge>
                            </div>

                            <p className="text-muted-foreground mb-2">{option.description}</p>

                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                <div className="flex items-center gap-2 text-sm">
                                    <span className="font-medium text-green-600">{currency(option.amount)}</span>
                                </div>
                                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                    <Clock className="w-4 h-4" />
                                    <span className="font-medium">{option.duration}</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="flex items-center ml-4">
                        <SheetDrawer
                            open={editState.isOpen}
                            title="Edit Delivery Option"
                            trigger={
                                <Button size="icon" variant="ghost" onClick={editState.open}>
                                    <Pencil className="h-5 w-5" />
                                </Button>
                            }
                            onOpenChange={editState.setOpen}
                        >
                            <DeliveryOptionForm initialData={option} onClose={editState.close} />
                        </SheetDrawer>
                        <ConfirmDrawer
                            open={deleteState.isOpen}
                            onOpenChange={deleteState.setOpen}
                            trigger={
                                <Button className="p-2 text-red-600 bg-red-50 hover:bg-red-100" size="icon">
                                    <Trash2 className="w-4 h-4" />
                                </Button>
                            }
                            onClose={deleteState.close}
                            onConfirm={handleDelete}
                            title="Delete"
                            confirmText="Delete"
                            isLoading={isPending}
                        />
                    </div>
                </div>
            </div>
        </div>
    );
};

const DeliveryOverview: React.FC = () => {
    const addState = useOverlayTriggerState({});

    const { data: deliveryOptions, isLoading, error } = useAdminDeliveryOptions(); 

    if (error) {
        return <ServerError error={error.message} scenario="delivery" stack={error.stack} />;
    }

    if (isLoading) {
        return <ComponentLoader className="h-[400px]" />;
    }

    if (!deliveryOptions || deliveryOptions.length === 0) {
        return (
            <ZeroState title="No delivery options yet" description="Start organizing your delivery options by creating your first delivery option." />
        );
    }

    return (
        <div className="container mx-auto py-6">
            <div className="flex flex-row items-center justify-between py-2">
                <h3 className="text-lg font-semibold">Delivery Options</h3>
                <SheetDrawer
                    open={addState.isOpen}
                    title="Add Delivery Option"
                    trigger={
                        <Button>
                            <Plus className="h-4 w-4" />
                            Add Option
                        </Button>
                    }
                    onOpenChange={addState.setOpen}
                >
                    <DeliveryOptionForm onClose={addState.close} />
                </SheetDrawer>
            </div>

            <div className="space-y-4">
                {deliveryOptions?.map((option: DeliveryOption, idx: number) => (
                    <DeliveryItem key={idx} option={option} />
                ))}
            </div>
        </div>
    );
};

export default DeliveryOverview;
