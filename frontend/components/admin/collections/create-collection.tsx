"use client";

import React from "react";
import { useOverlayTriggerState } from "@react-stately/overlays";

import { Drawer, DrawerTrigger, DrawerContent, DrawerHeader, DrawerTitle } from "@/components/ui/drawer";
import { Button } from "@/components/ui/button";
import { CollectionForm } from "@/components/admin/collections/collection-form";

interface Props {}

const CreateCollection: React.FC<Props> = () => {
    const state = useOverlayTriggerState({});

    return (
        <div className="relative flex items-center gap-2">
            <Drawer open={state.isOpen} onOpenChange={state.setOpen}>
                <DrawerTrigger asChild>
                    <Button onClick={state.open}>Create Collection</Button>
                </DrawerTrigger>
                <DrawerContent>
                    <DrawerHeader>
                        <DrawerTitle>Create Collection</DrawerTitle>
                    </DrawerHeader>
                    <div className="max-w-2xl">
                        <CollectionForm type="create" onClose={state.close} />
                    </div>
                </DrawerContent>
            </Drawer>
        </div>
    );
};

export { CreateCollection };
