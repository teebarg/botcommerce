import { Separator } from "@/components/ui/separator";
import CartSummary from "../cart/cart-summary";
import { Cart, CartItem } from "@/schemas";
import CartItemComponent from "../cart/cart-item";

const CheckoutSummary: React.FC<{ cart: Cart }> = ({ cart }) => {
    return (
        <div className="relative md:sticky md:top-0 px-2 py-4 md:w-[400px] hidden md:block min-w-0 overflow-hidden">
            <h2 className="font-medium">Cart Summary</h2>
            <Separator className="my-2" />
            <CartSummary cart={cart!} />
            <div className="max-h-[55vh] w-full bg-card overflow-y-auto rounded-xl mt-4">
                {cart?.items?.map((item: CartItem) => (
                    <CartItemComponent key={item.variant_id} item={item} />
                ))}
            </div>
        </div>
    );
};

export default CheckoutSummary;
