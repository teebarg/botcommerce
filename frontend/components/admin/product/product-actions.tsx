"use client";

import { useOverlayTriggerState } from "@react-stately/overlays";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Edit, Trash2 } from "lucide-react";

import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import DrawerUI from "@/components/drawer";
import { api } from "@/apis";
import { Product } from "@/types/models";
import { ProductView } from "@/components/products/product-view";
import { Confirm } from "@/components/generic/confirm";
import { useInvalidate } from "@/lib/hooks/useAdmin";

interface ProductActionsProps {
    product: Product;
}

export function ProductActions({ product }: ProductActionsProps) {
    const deleteState = useOverlayTriggerState({});
    const viewState = useOverlayTriggerState({});
    const router = useRouter();
    const invalidate = useInvalidate();

    const deleteProduct = async (id: number) => {
        // "use server";
        const { error } = await api.product.delete(id);

        if (error) {
            toast.error(error);

            return;
        }

        invalidate("products");
        invalidate("product-search");
        toast.success(`Product deleted successfully`);
        router.refresh();
        deleteState.close();
    };

    return (
        <div className="flex space-x-1">
            <DrawerUI open={viewState.isOpen} title={`Edit Product`} trigger={<Edit className="h-5 w-5" />} onOpenChange={viewState.setOpen}>
                <ProductView product={product} onClose={viewState.close} />
            </DrawerUI>
            <Dialog open={deleteState.isOpen} onOpenChange={deleteState.setOpen}>
                <DialogTrigger>
                    <Trash2 className="h-5 w-5 text-danger" />
                </DialogTrigger>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle className="sr-only">Delete</DialogTitle>
                    </DialogHeader>
                    <Confirm onClose={deleteState.close} onConfirm={() => deleteProduct(product.id)} />
                </DialogContent>
            </Dialog>
        </div>
    );
}
