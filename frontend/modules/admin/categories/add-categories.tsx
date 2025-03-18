"use client";

import React from "react";
import { useOverlayTriggerState } from "react-stately";

import { CategoryForm } from "./category-form";

import { Button } from "@/components/ui/button";
import { Drawer, DrawerTrigger, DrawerContent, DrawerHeader, DrawerTitle, DrawerDescription } from "@/components/ui/drawer";

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
                        <DrawerTitle>Add Category</DrawerTitle>
                        <DrawerDescription>Test</DrawerDescription>
                    </DrawerHeader>
                    <div className="max-w-2xl">
                        <CategoryForm type="create" onClose={state.close} />
                    </div>
                    {/* <DrawerFooter className="justify-end">
                        <DrawerClose className="border border-input bg-background inline-flex items-center justify-center rounded-md text-sm font-medium focus-visible:outline-none disabled:pointer-events-none disabled:opacity-50 h-10 px-8">
                            Cancel
                        </DrawerClose>
                    </DrawerFooter> */}
                </DrawerContent>
            </Drawer>
        </React.Fragment>
    );
};

export default AddCategory;
