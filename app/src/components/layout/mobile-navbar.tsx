import { Link } from "@tanstack/react-router";
import { BackButton } from "@/components/back";
import GetApp from "@/components/get-app";
import { SearchDialog } from "@/components/store/product-search";
import { ShoppingBag } from "lucide-react";
import { UserButton, Show, SignInButton, SignUpButton } from "@clerk/tanstack-react-start";

const MobileHeader = () => {
    return (
        <div className="fixed md:hidden top-0 inset-x-0 z-40 bg-background/60 backdrop-blur-md px-3 py-3 flex items-center gap-2">
            <div className="flex gap-2 items-center flex-1">
                <BackButton />
                <Link to="/">
                    <div className="w-9 h-9 rounded-lg gradient-primary flex items-center justify-center">
                        <ShoppingBag className="w-5 h-5 text-white" />
                    </div>
                </Link>
            </div>
            <SearchDialog />
            <GetApp />
            <div className="ml-auto">
                <Show when="signed-in">
                    <UserButton />
                </Show>
                <Show when="signed-out">
                    <SignInButton />
                    <SignUpButton />
                </Show>
            </div>
        </div>
    );
};

export default MobileHeader;
