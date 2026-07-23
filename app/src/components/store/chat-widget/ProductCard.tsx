import { ShoppingBag } from "lucide-react";
import { useMemo } from "react";
import { useCart } from "@/providers/cart-provider";
import { CartItem, ChatProduct } from "@/schemas";
import { useAddToCart, useChangeCartQuantity } from "@/hooks/useCart";
import { Button } from "@/components/ui/button";
import { track } from "@/lib/analytics";
import { currency } from "@/utils";

export const ProductCard = ({ product }: { product: ChatProduct }) => {
    const { cart } = useCart();
    const { mutateAsync: addToCart, isPending: creating } = useAddToCart();
    const { mutateAsync: updateQuantity, isPending: updating } = useChangeCartQuantity();

    const loading = creating || updating;

    const variantInCart = useMemo(() => {
        return cart?.items?.find((item: CartItem) => item.variant_id == product.variants[0].id);
    }, [cart, product.id]);

    const handleAddToCart = async () => {
        if (!product.id) return;

        if (variantInCart) {
            updateQuantity({ item_id: variantInCart.id, quantity: variantInCart.quantity + 1 }).then(() => {
                track("product_added_to_cart", { variant_id: product.id })
            });
            return;
        }
        addToCart({
            variant_id: product.variants[0].id,
            quantity: 1,
        }).then(() => {
            track("product_added_to_cart", { variant_id: product.id })
        });
    };
    return (
        <div key={product.sku} className="glass rounded-2xl overflow-hidden min-w-[160px] max-w-[160px] shrink-0">
            <div className="relative h-28 overflow-hidden">
                <img src={product.image || "/placeholder.jpg"} alt={product.name} className="w-full h-full object-cover" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                <span className="absolute bottom-2 left-2 text-xs font-semibold text-foreground">{currency(product.variants[0].price)}</span>
            </div>
            <div className="p-3 space-y-2">
                <p className="text-xs font-medium text-foreground truncate">{product.name}</p>
                <Button onClick={handleAddToCart} className="w-full" size="xxs" isLoading={loading} disabled={loading}>
                    <ShoppingBag className="w-3 h-3" />
                    Add
                </Button>
            </div>
        </div>
    );
};
