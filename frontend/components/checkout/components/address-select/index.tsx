"use client";

import { useMemo } from "react";
import { omit } from "@lib/util/util";
import { Loader } from "nui-react-icons";
import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Search, Plus, Home, Pencil, MapPin } from "lucide-react";
import { useOverlayTriggerState } from "@react-stately/overlays";
import { usePathname } from "next/navigation";
import { toast } from "sonner";

import { Address, User } from "@/types/models";
import { api } from "@/apis";
import { Button } from "@/components/ui/button";
import { Drawer, DrawerContent, DrawerHeader, DrawerTitle, DrawerTrigger } from "@/components/ui/drawer";
import ShippingAddressForm from "@/components/checkout/address-form";
import ShippingAddressFormEdit from "@/components/checkout/address-form-edit";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { MagicLinkForm } from "@/components/generic/auth/magic-link";
import ClientOnly from "@/components/generic/client-only";
import { SignUpForm } from "@/components/generic/auth/signup";
import { useInvalidateCart, useUserAddresses } from "@/lib/hooks/useCart";

type AddressSelectProps = {
    address: Address | null;
    user: User | null;
};

interface AddressItemProp {
    address: Address;
    addresses: Address[];
    selectedAddress?: Address;
}

const AddressItem: React.FC<AddressItemProp> = ({ address, addresses, selectedAddress }) => {
    const state = useOverlayTriggerState({});
    const invalidateCart = useInvalidateCart();
    const [loading, setLoading] = useState<boolean>(false);

    const handleSelect = async (id: number) => {
        setLoading(true);
        const savedAddress = addresses.find((a) => a.id === id);

        if (savedAddress) {
            const res = await api.cart.updateDetails({
                shipping_address: omit(savedAddress, ["created_at", "updated_at"]) as any,
            });

            if (res.error) {
                toast.error(res.error);

                return;
            }
            invalidateCart();
        }

        setLoading(false);
    };

    return (
        <motion.div
            key={address.id}
            animate={{ opacity: 1, y: 0 }}
            className={`relative cursor-pointer group ${
                selectedAddress?.id === address.id ? "bg-content2 border-1 border-primary" : "hover:bg-content2"
            } rounded-xl p-4 transition-all`}
            exit={{ opacity: 0, y: -20 }}
            initial={{ opacity: 0, y: 20 }}
            transition={{ duration: 0.2 }}
        >
            <div className="flex items-start space-x-4" onClick={() => handleSelect(address.id!)}>
                <div className="flex-shrink-0">
                    <Home className={`w-6 h-6 ${selectedAddress?.id === address.id ? "text-blue-500" : "text-gray-400"}`} />
                </div>
                <div className="flex-grow">
                    <div className="flex items-center justify-between">
                        <h3 className="font-medium text-default-900">
                            {address.address_type || "Home"}
                            {address.label && <span>({address.label})</span>}
                        </h3>
                    </div>
                    <p className="text-default-600 text-sm mt-1">
                        {address.address_1}
                        {address.address_2 && <span>, {address.address_2}</span>}
                        {address.postal_code && <span>, {address.postal_code}</span>}
                    </p>
                    <p className="text-default-500 text-sm capitalize">
                        {address.city}
                        {address.state && <span>, {address.state}</span>}
                    </p>
                    <p className="text-default-500 text-sm capitalize">{address.phone}</p>
                </div>
                <div className="flex items-center flex-shrink-0">
                    <Button
                        size="icon"
                        variant="ghost"
                        onClick={(e) => {
                            e.stopPropagation();
                            state.open();
                        }}
                    >
                        <Pencil className="w-4 h-4" />
                    </Button>
                    {/* {selectedAddress?.id === address.id && <Check className="w-5 h-5 text-blue-500" />} */}
                </div>
            </div>
            {loading && (
                <div className="absolute inset-0 bg-gray-200 bg-opacity-50 flex items-center justify-center">
                    <Loader className="mr-2 h-4 w-4 animate-spin" />
                </div>
            )}
            <Drawer open={state.isOpen} onOpenChange={state.setOpen}>
                <DrawerContent>
                    <DrawerHeader>
                        <DrawerTitle className="sr-only">Address</DrawerTitle>
                    </DrawerHeader>
                    <div className="p-6">
                        <ShippingAddressFormEdit address={address} onClose={state.close} />
                    </div>
                </DrawerContent>
            </Drawer>
        </motion.div>
    );
};

const EmptyState = () => {
    return (
        <div className="flex flex-col items-center justify-center py-8 px-4">
            <div className="w-12 h-12 bg-blue-50 rounded-full flex items-center justify-center mb-4">
                <MapPin className="w-8 h-8 text-blue-500" />
            </div>
            <h3 className="text-lg font-semibold text-default-900 mb-2">No Addresses Found</h3>
            <p className="text-default-500 text-center mb-6">
                {`You haven't added any addresses yet. Add your first address to get started with your order.`}
            </p>
        </div>
    );
};

const CheckoutLoginPrompt: React.FC = () => {
    const pathname = usePathname();

    return (
        <ClientOnly>
            <div className="max-w-md mx-auto overflow-hidden md:max-w-2xl my-8">
                <div className="p-8">
                    <div className="flex justify-center mb-6">
                        <div className="bg-indigo-100 p-3 rounded-full">
                            <svg
                                className="w-8 h-8 text-indigo-600"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                                xmlns="http://www.w3.org/2000/svg"
                            >
                                <path
                                    d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth="2"
                                />
                            </svg>
                        </div>
                    </div>

                    <div className="text-center mb-8">
                        <h2 className="text-2xl font-bold text-default-800">Sign in required</h2>
                        <p className="mt-3 text-default-600">Please sign in to your account to continue with your checkout process</p>
                    </div>

                    <div className="flex items-center justify-center">
                        <Dialog>
                            <DialogTrigger asChild>
                                <Button>Sign in to continue</Button>
                            </DialogTrigger>
                            <DialogContent>
                                <DialogHeader>
                                    <DialogTitle className="sr-only">Log in</DialogTitle>
                                </DialogHeader>
                                <MagicLinkForm callbackUrl={pathname} />
                            </DialogContent>
                        </Dialog>
                    </div>

                    <div className="mt-6 text-center text-sm text-default-500">
                        <Dialog>
                            <DialogTrigger>
                                <p>
                                    {`Don't have an account?`}
                                    <span className="font-medium text-indigo-600 hover:text-indigo-500">Create one now</span>
                                </p>
                            </DialogTrigger>
                            <DialogContent>
                                <DialogHeader>
                                    <DialogTitle className="sr-only">Sign Up</DialogTitle>
                                </DialogHeader>
                                <SignUpForm />
                            </DialogContent>
                        </Dialog>
                    </div>
                </div>
            </div>
        </ClientOnly>
    );
};

const AddressSelect: React.FC<AddressSelectProps> = ({ address, user }) => {
    const { data, isLoading } = useUserAddresses();
    const addresses = data?.addresses ?? [];

    const state = useOverlayTriggerState({});
    const [searchQuery, setSearchQuery] = useState<string>("");

    const filteredAddresses = addresses.filter(
        (address) =>
            address.address_1.toLowerCase().includes(searchQuery.toLowerCase()) || address.city.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const selectedAddress = useMemo(() => addresses.find((a) => a.id === address?.id), [addresses, address]);

    if (isLoading) {
        return <div className="h-24" />;
    }

    if (!user) {
        return <CheckoutLoginPrompt />;
    }

    return (
        <div className="w-auto overflow-hidden bg-content1">
            <div className="border-b border-gray-100">
                {(filteredAddresses.length > 0 || searchQuery) && (
                    <div className="relative mb-6">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                        <input
                            className="w-full pl-10 pr-4 py-3 rounded-xl border border-gray-200 outline-none transition-all"
                            placeholder="Search addresses..."
                            type="text"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                    </div>
                )}

                <div className="space-y-3 max-h-[30vh] overflow-y-auto">
                    <AnimatePresence>
                        {filteredAddresses.length === 0 ? (
                            <motion.div
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -20 }}
                                initial={{ opacity: 0, y: 20 }}
                                transition={{ duration: 0.2 }}
                            >
                                <EmptyState />
                            </motion.div>
                        ) : (
                            filteredAddresses.map((address: Address) => (
                                <AddressItem key={address.id} address={address} addresses={addresses} selectedAddress={selectedAddress} />
                            ))
                        )}
                    </AnimatePresence>
                </div>
            </div>

            <Drawer open={state.isOpen} onOpenChange={state.setOpen}>
                <DrawerTrigger asChild>
                    <Button className="w-full mt-6" variant="default">
                        <Plus className="w-5 h-5 mr-2" />
                        <span>Add New Address</span>
                    </Button>
                </DrawerTrigger>
                <DrawerContent>
                    <DrawerHeader>
                        <DrawerTitle className="sr-only">Address</DrawerTitle>
                    </DrawerHeader>
                    <div className="p-6">
                        <ShippingAddressForm onClose={state.close} />
                    </div>
                </DrawerContent>
            </Drawer>
        </div>
    );
};

export default AddressSelect;
