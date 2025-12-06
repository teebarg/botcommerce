import { useOverlayTriggerState } from "react-stately";
import { Pencil, Trash2 } from "lucide-react";

import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { ProductSearch } from "@/schemas/product";
import { ProductView } from "@/components/products/product-view";
import { Confirm } from "@/components/generic/confirm";
import Overlay from "@/components/overlay";
import { Button } from "@/components/ui/button";
import { useDeleteProduct } from "@/hooks/useProduct";

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
                sheetClassName="min-w-[700px]"
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
            <Dialog open={deleteState.isOpen} onOpenChange={deleteState.setOpen}>
                <DialogTrigger asChild>
                    <Button size="icon" variant="ghost">
                        <Trash2 className="h-5 w-5 text-destructive" />
                    </Button>
                </DialogTrigger>
                <DialogContent>
                    <DialogHeader className="sr-only">
                        <DialogTitle>Delete</DialogTitle>
                    </DialogHeader>
                    <Confirm onClose={deleteState.close} onConfirm={() => deleteProduct(product.id)} />
                </DialogContent>
            </Dialog>
        </div>
    );
}
