"use client";

import { motion, AnimatePresence } from "framer-motion";
import { useOverlayTriggerState } from "@react-stately/overlays";

import { ProductDetails } from "../admin/product/product-details";

import ProductUpload from "./product-upload";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import DrawerUI from "@/components/drawer";
import { ProductView } from "@/components/products/product-view";

export function ProductInventory() {
    const addState = useOverlayTriggerState({});

    return (
        <Card>
            <CardHeader>
                <CardTitle>Product Inventory</CardTitle>
                <CardDescription>Manage your product inventory and stock levels.</CardDescription>
            </CardHeader>
            <CardContent>
                <AnimatePresence>
                    <motion.div animate={{ opacity: 1 }} initial={{ opacity: 0 }} transition={{ duration: 0.5 }}>
                        <div className="max-w-[30rem] mb-8 w-full">
                            <ProductUpload />
                        </div>
                        <DrawerUI
                            // direction="right"
                            open={addState.isOpen}
                            title={`Add Product`}
                            trigger={
                                <span className="h-10 rounded-md px-8 mb-4 bg-primary text-white hover:bg-primary/90 inline-flex items-center text-sm font-medium transition-colors focus-visible:outline-none">
                                    Add Product
                                </span>
                            }
                            onOpenChange={addState.setOpen}
                        >
                            <ProductView onClose={addState.close} />
                        </DrawerUI>
                        <ProductDetails />
                    </motion.div>
                </AnimatePresence>
            </CardContent>
        </Card>
    );
}
