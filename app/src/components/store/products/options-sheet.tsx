import type { ProductSearch, ProductVariant } from "@/schemas";
import { Drawer, DrawerContent } from "@/components/ui/drawer";
import { ProductOptionsSheet } from "./product-options-sheet";

interface OptionsSheetProps {
    product: ProductSearch | null;
    open: boolean;
    onOpenChange: (open: boolean) => void;
    onConfirm: (variant: ProductVariant) => void;
    confirmLabel: string;
    selectedIds?: Set<number>;
    showWhatsApp?: boolean;
}

export function OptionsSheet({ product, open, onOpenChange, onConfirm, ...rest }: OptionsSheetProps) {
    return (
        <Drawer open={open && !!product} onOpenChange={onOpenChange}>
            <DrawerContent className="rounded-t-3xl">
                {product && (
                    <ProductOptionsSheet
                        product={product}
                        {...rest}
                        onConfirm={(variant) => {
                            onConfirm(variant);
                            onOpenChange(false);
                        }}
                        allowAlreadySelected
                    />
                )}
            </DrawerContent>
        </Drawer>
    );
}
