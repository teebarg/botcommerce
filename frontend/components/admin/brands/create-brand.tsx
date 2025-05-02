"use client";

import React from "react";
import { useOverlayTriggerState } from "@react-stately/overlays";

import { Drawer, DrawerTrigger, DrawerContent, DrawerHeader, DrawerTitle } from "@/components/ui/drawer";
import { BrandForm } from "@/components/admin/brands/brand-form";
import { Button } from "@/components/ui/button";

interface Props {}

const CreateBrand: React.FC<Props> = () => {
    const state = useOverlayTriggerState({});

    return (
        <div className="relative flex items-center gap-2">
            <Drawer open={state.isOpen} onOpenChange={state.setOpen}>
                <DrawerTrigger asChild>
                    <Button variant="outline" onClick={state.open}>
                        Create Brand
                    </Button>
                </DrawerTrigger>
                <DrawerContent className="px-4">
                    <DrawerHeader>
                        <DrawerTitle>Create Brand</DrawerTitle>
                    </DrawerHeader>
                    <div className="max-w-2xl">
                        <BrandForm onClose={state.close} />
                    </div>
                </DrawerContent>
            </Drawer>
        </div>
    );
};

export { CreateBrand };
