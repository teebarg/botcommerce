// import type React from "react";
// import { Home, Search, User } from "lucide-react";
// import StoreMenuComp from "./store-mobile-menu-drawer";
// import { CartComponent } from "@/components/store/cart/cart-component";
// import LocalizedClientLink from "@/components/ui/link";

// const ButtonNav = () => {
//     interface NavLink {
//         icon: React.ReactNode;
//         label: string;
//         href: string;
//     }

//     const nav: NavLink[] = [
//         {
//             icon: <Home className="h-7 w-7" />,
//             label: "Home",
//             href: "/",
//         },
//         {
//             icon: <Search className="h-7 w-7" />,
//             label: "Shop",
//             href: "/collections",
//         },
//         {
//             icon: <User className="h-7 w-7" />,
//             label: "Account",
//             href: "/account",
//         },
//     ];

//     return (
//         <nav
//             className="md:hidden fixed bottom-0 inset-x-0 z-40 bg-background/60 backdrop-blur-md shadow-xl flex items-center justify-between px-8 pt-3 text-2xs"
//             style={{
//                 paddingBottom: `calc(var(--sab) + 12px)`,
//             }}
//         >
//             {nav.map((item: NavLink, idx: number) => (
//                 <div key={idx} className="flex flex-col items-center">
//                     <LocalizedClientLink active="bg-gradient-primary text-white rounded-xl" className="p-1.5" href={item.href}>
//                         {item.icon}
//                     </LocalizedClientLink>
//                     {item.label}
//                 </div>
//             ))}
//             <div className="flex flex-col items-center gap-1">
//                 <CartComponent />
//                 Cart
//             </div>
//             <StoreMenuComp />
//         </nav>
//     );
// };

// export default ButtonNav;

import type React from "react";
import { Home, Search, User } from "lucide-react";
import StoreMenuComp from "./store-mobile-menu-drawer";
import { CartComponent } from "@/components/store/cart/cart-component";
import LocalizedClientLink from "@/components/ui/link";
import { useCart } from "@/providers/cart-provider";
import type { CartItem } from "@/schemas";

function formatNairaCompact(amount: number) {
    if (amount >= 1_000_000) return `₦${(amount / 1_000_000).toFixed(1)}m`;
    if (amount >= 1_000) return `₦${(amount / 1_000).toFixed(0)}k`;
    return `₦${amount}`;
}

const ButtonNav = () => {
    const { cart } = useCart();

    const totalAmount =
        cart?.items?.reduce((acc: number, item: CartItem) => acc + item.price * item.quantity, 0) ?? 0;

    const hasItems = totalAmount > 0;

    interface NavLink {
        icon: React.ReactNode;
        label: string;
        href: string;
    }

    const nav: NavLink[] = [
        { icon: <Home className="h-7 w-7" />, label: "Home", href: "/" },
        { icon: <Search className="h-7 w-7" />, label: "Shop", href: "/collections" },
        { icon: <User className="h-7 w-7" />, label: "Account", href: "/account" },
    ];

    return (
        <nav
            className="md:hidden fixed bottom-0 inset-x-0 z-40 bg-background/60 backdrop-blur-md shadow-xl flex items-center justify-between px-8 pt-3 text-2xs"
            style={{ paddingBottom: `calc(var(--sab) + 12px)` }}
        >
            {nav.map((item: NavLink, idx: number) => (
                <div key={idx} className="flex flex-col items-center">
                    <LocalizedClientLink
                        active="bg-gradient-primary text-white rounded-xl"
                        className="p-1.5"
                        href={item.href}
                    >
                        {item.icon}
                    </LocalizedClientLink>
                    {item.label}
                </div>
            ))}

            <div className="flex flex-col items-center gap-0">
                <CartComponent />
                {hasItems ? (
                    <span className="text-accent font-medium text-2xs -mt-1">
                        {formatNairaCompact(totalAmount)}
                    </span>
                ) : (
                    <span>Cart</span>
                )}
            </div>

            <StoreMenuComp />
        </nav>
    );
};

export default ButtonNav;
