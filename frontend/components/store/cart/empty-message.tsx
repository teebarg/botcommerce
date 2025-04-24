import { ShoppingCart } from "lucide-react";

import { BtnLink } from "@/components/ui/btnLink";

const EmptyCartMessage = () => {
    return (
        <div className="max-w-7xl mx-auto flex flex-col items-center my-8">
            <ShoppingCart className="h-14 w-14 text-default-300 mb-4" />
            <p className="text-xl font-semibold">Your cart is empty2</p>
            <p className="text-default-500 font-medium">Continue shopping to explore more.</p>
            <BtnLink className="mt-4 rounded-full text-sm" href="/collections">
                Continue Shopping
            </BtnLink>
        </div>
    );
};

export default EmptyCartMessage;
