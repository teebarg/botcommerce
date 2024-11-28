"use client";

import React, { useState } from "react";
import { Category } from "types/global";
import { Chip } from "@modules/common/components/chip";
import { ChevronRight, DotsSix, Folder, Tag } from "nui-react-icons";
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
    };

    return (
        <React.Fragment>
            <ol>
                {categories?.map((item: Category, index: number) => (
                    <li key={index} className="flex flex-col min-h-10">
                        <div className="flex items-center">
                            <div className="flex w-[32px] items-center">
                                <span draggable="true">
                                    <DotsSix className="cursor-grab" />
                                </span>
                            </div>
                            <div className="flex items-center w-full">
                                <div className="flex items-center gap-4 flex-1">
                                    <button className="flex items-center" disabled={item?.children.length == 0} onClick={() => handleClick(item.id)}>
                                        <ChevronRight
                                            className={clsx("transition-transform duration-300 text-default-900", {
                                                "rotate-90": open.includes(item.id),
                                                "!text-default-500": item?.children.length == 0,
                                            })}
                                        />
                                    </button>
                                    <div className="flex items-center">
                                        <Folder />
                                    </div>
                                    <span className="select-none text-sm font-medium capitalize flex-1">{item.name}</span>
                                    <Chip
                                        className="mr-2"
                                        color={item.is_active ? "success" : "danger"}
                                        title={item.is_active ? "active" : "inactive"}
                                    />
                                </div>
                                <CategoryAction category={item} />
                            </div>
                        </div>
                        {item.children && open.includes(item.id) && (
                            <ol className="mt-4 mb-4 block">
                                {item.children.map((item: Category, index: number) => (
                                    <li key={index} className="ml-10 min-h-10">
                                        <div className="flex items-center">
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
                                                    <span className="ml-2 select-none text-xs font-medium text-default-500 capitalize">
                                                        {item.name}
                                                    </span>
                                                </div>
                                                <CategoryAction canAdd={false} category={item} />
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
