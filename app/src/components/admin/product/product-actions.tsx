import { useOverlayTriggerState } from "react-stately";
import { Pencil, Trash2 } from "lucide-react";
import type { ProductSearch } from "@/schemas/product";
import { ProductView } from "@/components/products/product-view";
import Overlay from "@/components/overlay";
import { Button } from "@/components/ui/button";
import { useDeleteProduct } from "@/hooks/useProduct";
import { ConfirmDrawer } from "@/components/generic/confirm-drawer";

interface ProductActionsProps {
    product: ProductSearch;
}

export function ProductActions({ product }: ProductActionsProps) {
    const deleteState = useOverlayTriggerState({});
    const viewState = useOverlayTriggerState({});
    const deleteProductMutation = useDeleteProduct();

    const deleteProduct = async (id: number) => {
        deleteProductMutation.mutateAsync(id).then(() => {
            deleteState.close();
        });
    };

    return (
        <div className="flex">
            <Overlay
                open={viewState.isOpen}
                title="Edit Product"
                trigger={
                    <Button size="icon" variant="ghost">
                        <Pencil className="h-5 w-5" />
                    </Button>
                }
                onOpenChange={viewState.setOpen}
            >
                <ProductView product={product} onClose={viewState.close} />
            </Overlay>
            <ConfirmDrawer
                open={deleteState.isOpen}
                onOpenChange={deleteState.setOpen}
                trigger={
                    <Button size="icon" variant="ghost">
                        <Trash2 className="h-5 w-5 text-destructive" />
                    </Button>
                }
                onClose={deleteState.close}
                onConfirm={() => deleteProduct(product.id)}
                title="Delete Product"
                isLoading={deleteProductMutation.isPending}
            />
        </div>
    );
}
