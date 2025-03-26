"use client";

import React, { cloneElement, isValidElement, useState } from "react";
import { Plus, Search } from "nui-react-icons";
import { useUpdateQuery } from "@lib/hooks/useUpdateQuery";
import { useSnackbar } from "notistack";
import { useOverlayTriggerState } from "@react-stately/overlays";
import { Input } from "@components/ui/input";

import { Pagination } from "../pagination";
import { SlideOver } from "../slideover";

import { Button } from "@/components/ui/button";
import { Pag } from "@/types/models";
import { api } from "@/apis";
import { X } from "lucide-react";

interface Props {
    children: React.ReactNode;
    columns: string[];
    pagination?: Pag;
    canAdd?: boolean;
    canExport?: boolean;
    canIndex?: boolean;
    canSearch?: boolean;
    searchQuery?: string;
    form?: React.ReactNode;
    isDataOnly?: boolean;
}

const Table: React.FC<Props> = ({
    columns,
    children,
    pagination,
    canAdd = true,
    canExport = false,
    canIndex = false,
    canSearch = true,
    searchQuery,
    form,
    isDataOnly = false,
}) => {
    const { updateQuery } = useUpdateQuery();
    const { enqueueSnackbar } = useSnackbar();
    const [isExporting, setIsExporting] = useState(false);
    const [isIndexing, setIsIndexing] = useState(false);
    const state = useOverlayTriggerState({});
    const closeSlideOver = () => {
        state.close();
    };
    const formWithHandler = isValidElement(form) ? cloneElement(form as React.ReactElement, { onClose: closeSlideOver }) : form;

    const onSearchChange = React.useCallback(
        (query: string) => {
            updateQuery([{ key: "search", value: query }]);
        },
        [updateQuery]
    );
    const onClear = React.useCallback(() => {
        onSearchChange("");
    }, [onSearchChange]);

    const handleIndex = async () => {
        setIsIndexing(true);
        const res = await api.product.reIndex();

        enqueueSnackbar(res.message, { variant: res.error ? "error" : "success" });
        setIsIndexing(false);
    };

    const handleExport = async () => {
        try {
            setIsExporting(true);
            const res = await api.product.export();

            enqueueSnackbar(res.message, { variant: "success" });
        } catch (error) {
            enqueueSnackbar("Error exporting products", { variant: "error" });
        } finally {
            setIsExporting(false);
        }
    };

    return (
        <React.Fragment>
            {!isDataOnly && (
                <div className="flex flex-col gap-4">
                    <div className="flex justify-between gap-3 items-center">
                        <div className="flex-1">
                            {canSearch && (
                                <Input
                                    defaultValue={searchQuery}
                                    placeholder="Search by name..."
                                    startContent={<Search className="text-default-500" />}
                                    onChange={(e) => onSearchChange(e.target.value)}
                                    endContent={searchQuery && <Button aria-label="clear search" endContent={<X />} onClick={onClear} />}
                                />
                            )}
                        </div>
                        <div className="flex items-center gap-3">
                            {canAdd && (
                                <Button aria-label="add new" color="primary" endContent={<Plus />} onClick={() => state.open()}>
                                    Add New
                                </Button>
                            )}
                            {canExport && (
                                <Button
                                    aria-label="export"
                                    className="min-w-28"
                                    color="secondary"
                                    disabled={isExporting}
                                    isLoading={isExporting}
                                    onClick={handleExport}
                                >
                                    Export
                                </Button>
                            )}
                            {canIndex && (
                                <Button
                                    aria-label="index"
                                    className="min-w-28"
                                    color="secondary"
                                    disabled={isIndexing}
                                    isLoading={isIndexing}
                                    onClick={handleIndex}
                                >
                                    Index
                                </Button>
                            )}
                        </div>
                    </div>
                    <div className="flex justify-between items-center">
                        <span className="text-default-900 text-sm">Total {pagination?.total_count} entries</span>
                    </div>
                </div>
            )}
            <div className="mt-2 flow-root">
                <div className="-mx-4 -my-2 overflow-x-auto sm:-mx-6 lg:-mx-8">
                    <div className="inline-block min-w-full py-2 align-middle sm:px-6 lg:px-8">
                        <div className="overflow-hidden shadow sm:rounded-lg">
                            <table className="min-w-full divide-y divide-gray-200 dark:divide-content3">
                                <thead>
                                    <tr>
                                        {columns.map((column: string, index: number) => (
                                            <th key={index} className="py-3.5 pl-4 pr-3 text-left text-xs font-semibold text-default-500" scope="col">
                                                {column}
                                            </th>
                                        ))}
                                    </tr>
                                </thead>
                                <tbody className="bg-content1">{children}</tbody>
                            </table>
                        </div>
                    </div>
                </div>
            </div>
            {pagination && pagination?.total_pages > 1 && <Pagination pagination={pagination} />}
            {state.isOpen && (
                <SlideOver className="bg-default-100" isOpen={state.isOpen} title="Add New" onClose={closeSlideOver}>
                    {state.isOpen && formWithHandler}
                </SlideOver>
            )}
        </React.Fragment>
    );
};

export { Table };
