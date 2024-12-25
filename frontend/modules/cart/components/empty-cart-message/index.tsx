import Image from "next/image";

import EmptyCart from "@/public/empty-cart.png";
import LocalizedClientLink from "@/modules/common/components/localized-client-link";

const EmptyCartMessage = () => {
    return (
        <div className="max-w-7xl mx-auto flex flex-col items-center py-6 space-y-4">
            <Image alt={"Empty cart"} className="w-40" src={EmptyCart} />
            <p className="text-xl font-semibold">Your cart is empty</p>
            <p className="text-default-500 font-medium">Continue shopping to explore more.</p>
            <LocalizedClientLink className="text-default py-2 px-4 bg-default-foreground rounded-md font-medium" href="/collections">
                Explore items
            </LocalizedClientLink>
        </div>
    );
};

export default EmptyCartMessage;
