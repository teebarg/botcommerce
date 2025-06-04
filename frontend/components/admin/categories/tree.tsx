"use client";

import React, { useState } from "react";
import { ChevronRight, DotsSix, Folder, Tag } from "nui-react-icons";
import Image from "next/image";

import CategoryAction from "./categories-control";

import { cn } from "@/lib/utils";
import { Category } from "@/types/models";
import { Badge } from "@/components/ui/badge";

interface Props {
    categories?: Category[];
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
                                    <button
                                        aria-label="open"
                                        className="flex items-center"
                                        disabled={item?.subcategories?.length == 0}
                                        onClick={() => handleClick(item.id!)}
                                    >
                                        <ChevronRight
                                            className={cn("transition-transform duration-300 text-default-900", {
                                                "rotate-90": open.includes(item.id!),
                                                "!text-default-500": item?.subcategories?.length == 0,
                                            })}
                                        />
                                    </button>
                                    <Folder />
                                    <span className="select-none text-sm font-medium capitalize flex-1">{item.name}</span>
                                    {item.image && (
                                        <div className="relative h-8 w-8 hidden md:block">
                                            <Image fill alt={item.name} src={item.image} />
                                        </div>
                                    )}
                                    <Badge className="mr-2" variant={item.is_active ? "emerald" : "destructive"}>
                                        {item.is_active ? "active" : "inactive"}
                                    </Badge>
                                </div>
                                <CategoryAction category={item} />
                            </div>
                        </div>
                        {item.subcategories && open.includes(item.id!) && (
                            <ol className="mt-4 mb-4 block">
                                {item.subcategories?.map((sub: Category, index: number) => (
                                    <li key={index} className="ml-10 min-h-10">
                                        <div className="flex items-center">
                                            <div className="flex w-[32px] items-center">
                                                <span draggable="true">
                                                    <DotsSix className="cursor-grab" />
                                                </span>
                                            </div>
                                            <div className="flex w-full items-center justify-between">
                                                <div className="flex items-center">
                                                    <Tag />
                                                    <span className="ml-2 select-none text-xs font-medium text-default-500 capitalize">
                                                        {sub.name}
                                                    </span>
                                                </div>
                                                <CategoryAction canAdd={false} category={sub} />
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
