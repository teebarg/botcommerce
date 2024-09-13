"use client";

import { Tooltip } from "@nextui-org/tooltip";
import { DeleteIcon, EditIcon, EyeIcon } from "nui-react-icons";
import React, { useEffect, useState } from "react";

interface Props {
    item: any;
}

const Actions: React.FC<Props> = ({ item }) => {
    return (
        <React.Fragment>
            <div className="relative flex items-center gap-2">
                <Tooltip content="Details">
                    <span className="text-lg text-default-400 cursor-pointer active:opacity-50">
                        {/* <EyeIcon onClick={() => navigate(`/admin/products/${item.id}`)} /> */}
                        <EyeIcon />
                    </span>
                </Tooltip>
                <Tooltip content="Edit products">
                    <span className="text-lg text-default-400 cursor-pointer active:opacity-50">
                        {/* <EditIcon onClick={() => handleEdit(item)} /> */}
                        <EditIcon />
                    </span>
                </Tooltip>
                <Tooltip color="danger" content="Delete products">
                    <span className="text-lg text-danger cursor-pointer active:opacity-50">
                        {/* <DeleteIcon onClick={() => onDelete(deleteModalRef, row)} /> */}
                        <DeleteIcon />
                    </span>
                </Tooltip>
            </div>
        </React.Fragment>
    );
};

export { Actions };
