"use client";

import React from "react";
import { useOverlayTriggerState } from "@react-stately/overlays";

import { CategoryForm } from "./category-form";

import { Button } from "@/components/ui/button";
import Overlay from "@/components/overlay";

interface Props {}

const CreateCategory: React.FC<Props> = () => {
    const state = useOverlayTriggerState({});

    return (
        <Overlay
            open={state.isOpen}
            title="Create Category"
            trigger={
                <Button variant="primary" onClick={state.open}>
                    Create Category
                </Button>
            }
            onOpenChange={state.setOpen}
        >
            <CategoryForm type="create" onClose={state.close} />
        </Overlay>
    );
};

export default CreateCategory;
