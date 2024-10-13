"use client";

import React from "react";

import { Metadata } from "next";
import { Collection, Product } from "types/global";
import { Table } from "@modules/common/components/table";
import ProductUpload from "@modules/admin/products/product-upload";
import { getCategories, getCollectionsList, getCustomer } from "@lib/data";
import { Actions } from "@modules/admin/components/actions";
import { CollectionForm } from "@modules/admin/collections/collection-form";
import { Chip } from "@modules/common/components/chip";
import { deleteCollection } from "@modules/admin/actions";
import { ChevronDown, DotsSix, EllipsisHorizontal, EllipsisVertical, Folder, Plus, Tag } from "nui-react-icons";

let items = [
    { id: 1, title: "Documents", children: [{ id: 2, title: "Project", children: [{ id: 3, title: "Weekly Report", children: [] }] }] },
    {
        id: 4,
        title: "Photos",
        children: [
            { id: 5, title: "Image 1", children: [] },
            { id: 6, title: "Image 2", children: [] },
        ],
    },
];

interface Props {
    categories: any;
}

const CategoryTree: React.FC<Props> = ({ categories }) => {
    return (
        <React.Fragment>
            <ol className="">
                {categories.map((item: any, index: number) => (
                    <li className="" key={index}>
                        <div className="flex h-[40px] items-center">
                            <div className="flex w-[32px] items-center">
                                <span className="" draggable="true">
                                    <DotsSix className="cursor-grab" />
                                </span>
                            </div>
                            <div className="flex w-full items-center justify-between">
                                <div className="flex items-center gap-4">
                                    <div className="flex cursor-pointer items-center">
                                        <ChevronDown />
                                    </div>
                                    <div className="flex items-center">
                                        <Folder />
                                    </div>
                                    <span className="select-none text-xs font-medium">Children</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <button className="btn btn-ghost btn-small">
                                        <Plus />
                                    </button>
                                    <div>
                                        <button
                                            className="btn btn-ghost btn-small h-xlarge w-xlarge focus-visible:border-violet-60 focus-visible:shadow-input focus:shadow-none focus-visible:outline-none"
                                            type="button"
                                        >
                                            <EllipsisHorizontal />
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                        {item.children && (
                            <ol>
                                {item.children.map((item: any, index: number) => (
                                    <li className="ml-10" key={index}>
                                        <div className="flex h-[40px] items-center">
                                            <div className="flex w-[32px] items-center">
                                                <span className="" draggable="true">
                                                    <DotsSix className="cursor-grab" />
                                                </span>
                                            </div>
                                            <div className="flex w-full items-center justify-between">
                                                <div className="flex items-center">
                                                    <div className="flex w-[32px] items-center justify-center">
                                                        <Tag />
                                                    </div>
                                                    <span className="ml-2 select-none text-xs font-medium text-gray-400">Boys</span>
                                                </div>
                                                <div className="flex items-center gap-2">
                                                    <button className="btn btn-ghost btn-small">
                                                        <Plus />
                                                    </button>
                                                    <div>
                                                        <button
                                                            className="btn btn-ghost btn-small h-xlarge w-xlarge focus-visible:border-violet-60 focus-visible:shadow-input focus:shadow-none focus-visible:outline-none"
                                                            type="button"
                                                        >
                                                            <EllipsisHorizontal />
                                                        </button>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </li>
                                ))}
                            </ol>
                        )}
                    </li>
                ))}
            </ol>
        </React.Fragment>
    );
};

export default CategoryTree;
