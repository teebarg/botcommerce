"use client";

import { useOverlayTriggerState } from "react-stately";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Edit, Trash } from "nui-react-icons";

import { ProductView } from "../products/product-view";

import DrawerUI from "@/components/drawer";
import { Button } from "@/components/ui/button";
import { api } from "@/apis";
import { Product } from "@/types/models";

interface ProductActionsProps {
    product: Product;
}

export function ProductActions({ product }: ProductActionsProps) {
    const viewState = useOverlayTriggerState({});
    const router = useRouter();

    const deleteProduct = async (id: number) => {
        // "use server";
        await api.product.delete(id);
        toast.success(`Product deleted successfully`);
        router.refresh();
    };

    return (
        <div className="flex justify-end gap-1">
            <DrawerUI
                direction="right"
                open={viewState.isOpen}
                title={`Edit Product`}
                trigger={<Edit className="h-5 w-5" />}
                onOpenChange={viewState.setOpen}
            >
                <ProductView product={product} onClose={viewState.close} />
            </DrawerUI>
            <Button size="icon" variant="ghost" onClick={() => deleteProduct(product.id)}>
                <Trash className="h-5 w-5 text-rose-500" />
            </Button>
        </div>
    );
}
