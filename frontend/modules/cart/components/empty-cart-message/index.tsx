import Image from "next/image";

import EmptyCart from "@/public/empty-cart.png";
import { BtnLink } from "@/components/ui/btnLink";

const EmptyCartMessage = () => {
    return (
        <div className="max-w-7xl mx-auto flex flex-col items-center py-6 space-y-4">
            <Image alt={"Empty cart"} className="w-40" src={EmptyCart} />
            <p className="text-xl font-semibold">Your cart is empty</p>
            <p className="text-default-500 font-medium">Continue shopping to explore more.</p>
            <BtnLink href="/collections">Explore items</BtnLink>
        </div>
    );
};

export default EmptyCartMessage;
