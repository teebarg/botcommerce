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
            trigger={
                <Button variant="primary" onClick={state.open}>
                    Create Category
                </Button>
            }
            open={state.isOpen}
            onOpenChange={state.setOpen}
            title="Create Category"
        >
            <CategoryForm type="create" onClose={state.close} />
        </Overlay>
    );
};

export default CreateCategory;
