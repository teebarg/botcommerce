"use client";

import React from "react";
import { useOverlayTriggerState } from "react-stately";

import { CategoryForm } from "./category-form";

import { Button } from "@/components/ui/button";
import { Drawer, DrawerTrigger, DrawerContent, DrawerHeader, DrawerTitle } from "@/components/ui/drawer";

interface Props {}

const AddCategory: React.FC<Props> = () => {
    const state = useOverlayTriggerState({});

    return (
        <React.Fragment>
            <Drawer open={state.isOpen} onOpenChange={state.setOpen}>
                <DrawerTrigger asChild>
                    <Button aria-label="add category" variant="outline">
                        <div>Add category</div>
                    </Button>
                </DrawerTrigger>
                <DrawerContent className="px-8">
                    <DrawerHeader>
                        <DrawerTitle className="py-6">Add Category</DrawerTitle>
                    </DrawerHeader>
                    <div className="max-w-lg">
                        <CategoryForm type="create" onClose={state.close} />
                    </div>
                </DrawerContent>
            </Drawer>
        </React.Fragment>
    );
};

export default AddCategory;
