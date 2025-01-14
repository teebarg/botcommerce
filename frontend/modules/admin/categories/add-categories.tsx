"use client";

import React from "react";
import { useOverlayTriggerState } from "react-stately";
import { SlideOver } from "@modules/common/components/slideover";

import { CategoryForm } from "./category-form";
import { Button } from "@/components/ui/button";

interface Props {}

const AddCategory: React.FC<Props> = () => {
    const slideOverState = useOverlayTriggerState({});

    return (
        <React.Fragment>
            <Button variant="bordered" onClick={slideOverState.open}>
                <span>Add category</span>
            </Button>
            {slideOverState.isOpen && (
                <SlideOver className="bg-default-100" isOpen={slideOverState.isOpen} title="Add Category" onClose={slideOverState.close}>
                    {slideOverState.isOpen && <CategoryForm type="create" onClose={slideOverState.close} />}
                </SlideOver>
            )}
        </React.Fragment>
    );
};

export default AddCategory;
