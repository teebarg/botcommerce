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
import { ChevronDown, ChevronRight, DotsSix, EllipsisHorizontal, EllipsisVertical, Folder, Plus, Tag } from "nui-react-icons";
import clsx from "clsx";
import CategoryAction from "./categories-control";

interface Props {
    categories: Category[];
}

const CategoryTree: React.FC<Props> = ({ categories }) => {
    const [open, setOpen] = useState<number[]>([]);

    const handleClick = (id: number) => {
        if (open.includes(id)) {
            setOpen(open.filter((item) => item !== id));
        } else {
            setOpen([...open, id]);
        }
        console.log(open);
    };

    return (
        <React.Fragment>
            <ol>
                {categories.map((item: Category, index: number) => (
                    <li className="h-14" key={index}>
                        <div className="flex h-[40px] items-center">
                            <div className="flex w-[32px] items-center">
                                <span draggable="true">
                                    <DotsSix className="cursor-grab" />
                                </span>
                            </div>
                            <div className="flex w-full items-center justify-between">
                                <div className="flex items-center gap-4">
                                    <button onClick={() => handleClick(item.id)} className="flex items-center" disabled={item?.children.length == 0}>
                                        <ChevronRight
                                            className={clsx("transition-transform duration-300 text-default-800", {
                                                "rotate-90": open.includes(item.id),
                                                "!text-default-500": item?.children.length == 0,
                                            })}
                                        />
                                    </button>
                                    <div className="flex items-center">
                                        <Folder />
                                    </div>
                                    <span className="select-none text-xs font-medium capitalize">{item.name}</span>
                                </div>
                                <CategoryAction category={item} />
                            </div>
                        </div>
                        {item.children && open.includes(item.id) && (
                            <ol>
                                {item.children.map((item: Category, index: number) => (
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
                                                    <span className="ml-2 select-none text-xs font-medium text-gray-400 capitalize">{item.name}</span>
                                                </div>
                                                <CategoryAction category={item} />
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
