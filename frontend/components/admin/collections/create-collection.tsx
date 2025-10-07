"use client";

import React from "react";
import { useOverlayTriggerState } from "@react-stately/overlays";

import { Button } from "@/components/ui/button";
import { CollectionForm } from "@/components/admin/collections/collection-form";
import Overlay from "@/components/overlay";

interface Props {}

const CreateCollection: React.FC<Props> = () => {
    const state = useOverlayTriggerState({});

    return (
        <Overlay
            open={state.isOpen}
            title="Create Collection"
            trigger={<Button onClick={state.open}>Create Collection</Button>}
            onOpenChange={state.setOpen}
        >
            <CollectionForm type="create" onClose={state.close} />
        </Overlay>
    );
};

export { CreateCollection };
