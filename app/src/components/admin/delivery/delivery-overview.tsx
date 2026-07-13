import { Plus } from "lucide-react";
import { toast } from "sonner";
import { Clock, type LucideProps, Package, Pencil, Trash2, Truck, Zap } from "lucide-react";
import { useOverlayTriggerState } from "react-stately";
import DeliveryOptionForm from "./delivery-option-form";
import { Button } from "@/components/ui/button";
import type { DeliveryOption, Message } from "@/schemas";
import { useDeliveryOptions } from "@/hooks/useApi";
import { Badge } from "@/components/ui/badge";
import { currency } from "@/utils";
import ServerError from "@/components/generic/server-error";
import { tryCatch } from "@/utils/try-catch";
import SheetDrawer from "@/components/sheet-drawer";
import { ConfirmDrawer } from "@/components/generic/confirm-drawer";
import { useState } from "react";
import { api } from "@/utils/api";
import { PageLoader } from "@/components/generic/page-loader";
import EmptyState from "@/components/generic/empty";

const DeliveryItem: React.FC<{ option: DeliveryOption }> = ({ option }) => {
    const editState = useOverlayTriggerState({});
    const deleteState = useOverlayTriggerState({});
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
        const { error } = await tryCatch<Message>(api.delete<Message>(`/delivery/${option.id}`));

        if (!error) {
            toast.success("Delivery option deleted successfully");
            deleteState.close();
        }
        setIsPending(false);
    };

    return (
        <div className="flex items-start justify-between p-4 bg-card rounded-2xl">
            <div className="flex items-start gap-4 flex-1">
                <div className="p-3 rounded-xl bg-accent/10">
                    <div className="text-accent">{getIcon(option.method)}</div>
                </div>

                <div className="flex-1">
                    <div className="flex items-center gap-3">
                        <h3 className="text-lg font-bold">{option.name}</h3>
                        <Badge variant={option.is_active ? "success" : "destructive"}>{option.is_active ? "Active" : "Inactive"}</Badge>
                    </div>

                    <p className="text-sm text-muted-foreground mb-2">{option.description}</p>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
                        <div className="font-semibold">
                            {currency(option.amount)}
                        </div>
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                            <Clock className="w-4 h-4" />
                            <span className="font-medium">{option.duration}</span>
                        </div>
                    </div>
                </div>
            </div>

            <div className="flex items-center gap-2 ml-4">
                <SheetDrawer
                    open={editState.isOpen}
                    title="Edit Delivery Option"
                    trigger={
                        <Button size="iconOnly" variant="ghost" onClick={editState.open}>
                            <Pencil className="h-6 w-6" />
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
                        <Button className="text-destructive" size="iconOnly" variant="ghost">
                            <Trash2 className="h-6 w-6" />
                        </Button>
                    }
                    onClose={deleteState.close}
                    onConfirm={handleDelete}
                    title="Delete"
                    description="This action cannot be undone. This will permanently delete the delivery option."
                    isLoading={isPending}
                />
            </div>
        </div>
    );
};

const DeliveryOverview: React.FC = () => {
    const addState = useOverlayTriggerState({});

    const { data: deliveryOptions, isLoading, error } = useDeliveryOptions();
    console.log(isLoading)

    if (error) {
        return <ServerError error={error.message} scenario="delivery" stack={error.stack} />;
    }

    if (isLoading) {
        return <PageLoader variant="list" rows={4} />;
    }

    if (!deliveryOptions || deliveryOptions.length === 0) {
        return (
            <EmptyState title="No delivery options yet" description="Start organizing your delivery options by creating your first delivery option." />

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
