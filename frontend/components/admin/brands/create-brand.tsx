"use client";

import React from "react";
import { useOverlayTriggerState } from "@react-stately/overlays";

import { BrandForm } from "@/components/admin/brands/brand-form";
import { Button } from "@/components/ui/button";
import Overlay from "@/components/overlay";

interface Props {}

const CreateBrand: React.FC<Props> = () => {
    const state = useOverlayTriggerState({});

    return (
        <Overlay
            open={state.isOpen}
            title="Create Brand"
            trigger={
                <Button variant="primary" onClick={state.open}>
                    Create Brand
                </Button>
            }
            onOpenChange={state.setOpen}
        >
            <BrandForm onClose={state.close} />
        </Overlay>
    );
};

export { CreateBrand };
