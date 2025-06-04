"use client";

import React from "react";
import { useOverlayTriggerState } from "@react-stately/overlays";

// import { Drawer, DrawerTrigger, DrawerContent, DrawerHeader, DrawerTitle } from "@/components/ui/drawer";
import { BrandForm } from "@/components/admin/brands/brand-form";
import { Button } from "@/components/ui/button";
import Overlay from "@/components/overlay";

interface Props {}

const CreateBrand: React.FC<Props> = () => {
    const state = useOverlayTriggerState({});

    return (
        <Overlay
            trigger={
                <Button variant="primary" onClick={state.open}>
                    Create Brand
                </Button>
            }
            open={state.isOpen}
            onOpenChange={state.setOpen}
            title="Create Brand"
        >
            <BrandForm onClose={state.close} />
        </Overlay>
    );
};

export { CreateBrand };
