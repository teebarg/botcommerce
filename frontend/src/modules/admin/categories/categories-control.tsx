"use client";

import React, { useState } from "react";

import { Metadata } from "next";
import { Category, Collection, Product } from "types/global";
import { Table } from "@modules/common/components/table";
import ProductUpload from "@modules/admin/products/product-upload";
import { getCategories, getCollectionsList, getCustomer } from "@lib/data";
import { Actions } from "@modules/admin/components/actions";
import { CollectionForm } from "@modules/admin/collections/collection-form";
import { Chip } from "@modules/common/components/chip";
import { deleteCollection } from "@modules/admin/actions";
import { ChevronDown, DotsSix, EllipsisHorizontal, EllipsisVertical, Folder, PencilSquare, Plus, Tag, Trash } from "nui-react-icons";
import clsx from "clsx";
import Dropdown from "@modules/common/components/dropdown";
import { useOverlayTriggerState } from "react-stately";
import { SlideOver } from "@modules/common/components/slideover";
import { CategoryForm } from "./category-form";

interface Props {
    canAdd?: boolean;
    category?: Category;
}

const CategoryAction: React.FC<Props> = ({ category, canAdd = true }) => {
    const slideOverState = useOverlayTriggerState({});
    const [isNew, setIsNew] = useState<boolean>(true);

    const editModal = () => {
        setIsNew(false);
        slideOverState.open();
    };

    const openModal = () => {
        setIsNew(true);
        slideOverState.open();
    };
    return (
        <React.Fragment>
            <div className="flex items-center gap-2">
                {canAdd && (
                    <button onClick={openModal}>
                        <Plus />
                    </button>
                )}
                <Dropdown trigger={<EllipsisHorizontal />}>
                    <div>
                        <div className="bg-white border-gray-200 rounded-lg shadow-md p-3 border min-w-[100px] text-sm font-medium">
                            <div className="mb-2">
                                <button className="flex w-full items-center" onClick={editModal}>
                                    <span className="mr-2">
                                        <PencilSquare />
                                    </span>
                                    <span>Edit</span>
                                </button>
                            </div>
                            <div>
                                <button
                                    className={clsx("flex w-full items-center text-rose-500", {
                                        "pointer-events-none select-none opacity-50": category?.children.length > 0,
                                    })}
                                    disabled={category?.children.length > 0}
                                >
                                    <span className="mr-2">
                                        <Trash />
                                    </span>
                                    <span>Delete</span>
                                </button>
                            </div>
                        </div>
                    </div>
                </Dropdown>
            </div>
            {slideOverState.isOpen && (
                <SlideOver
                    className="bg-default-50"
                    isOpen={slideOverState.isOpen}
                    title={isNew ? "Add Category" : "Edit Category"}
                    onClose={slideOverState.close}
                >
                    {slideOverState.isOpen && (
                        <CategoryForm
                            type={isNew ? "create" : "update"}
                            current={isNew ? undefined : category}
                            onClose={slideOverState.close}
                            hasParent
                            parent_id={category?.id}
                        />
                    )}
                </SlideOver>
            )}
        </React.Fragment>
    );
};

export default CategoryAction;
