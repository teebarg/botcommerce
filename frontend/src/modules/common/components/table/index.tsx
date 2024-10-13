"use client";

import React, { cloneElement, isValidElement, useState } from "react";
import { Pagination as PaginationType } from "types/global";
import { Input } from "@nextui-org/input";
import { Plus, SearchIcon } from "nui-react-icons";
import { useUpdateQuery } from "@lib/hooks/useUpdateQuery";
import { useSnackbar } from "notistack";
import { exportProducts, indexProducts } from "@modules/admin/actions";
import { useOverlayTriggerState } from "@react-stately/overlays";

import Button from "../button";
import { Pagination } from "../pagination";
import { SlideOver } from "../slideover";

interface Props {
    children: React.ReactNode;
    columns: string[];
    pagination?: PaginationType;
    canExport?: boolean;
    canIndex?: boolean;
    searchQuery?: string;
    form?: React.ReactNode;
    isDataOnly?: boolean;
}

const Table: React.FC<Props> = ({ columns, children, pagination, canExport = false, canIndex = false, searchQuery, form, isDataOnly = false }) => {
    const { updateQuery } = useUpdateQuery(1000);
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
        try {
            setIsIndexing(true);
            await indexProducts();
            enqueueSnackbar("Products indexed successfully", { variant: "success" });
        } catch (error) {
            console.error("Error indexing products:", error);
            enqueueSnackbar("Error indexing products", { variant: "error" });
        } finally {
            setIsIndexing(false);
        }
    };

    const handleExport = async () => {
        try {
            setIsExporting(true);
            const res = await exportProducts();

            enqueueSnackbar(res.message, { variant: res.success ? "success" : "error" });
        } catch (error) {
            console.error("Error exporting products:", error);
            enqueueSnackbar("Error exporting products", { variant: "error" });
        } finally {
            setIsExporting(false);
        }
    };

    return (
        <React.Fragment>
            {!isDataOnly && (
                <div className="flex flex-col gap-4">
                    <div className="flex justify-between gap-3 items-end">
                        <Input
                            isClearable
                            classNames={{
                                base: "w-full sm:max-w-[44%]",
                                inputWrapper: "border-1",
                            }}
                            defaultValue={searchQuery}
                            placeholder="Search by name..."
                            startContent={<SearchIcon className="text-default-300" />}
                            variant="bordered"
                            onClear={() => onClear()}
                            onValueChange={onSearchChange}
                        />
                        <div className="flex gap-3">
                            <Button color="primary" endContent={<Plus />} onClick={() => state.open()}>
                                Add New
                            </Button>
                            {canExport && (
                                <Button className="min-w-28" color="secondary" disabled={isExporting} isLoading={isExporting} onClick={handleExport}>
                                    Export
                                </Button>
                            )}
                            {canIndex && (
                                <Button className="min-w-28" color="secondary" disabled={isIndexing} isLoading={isIndexing} onClick={handleIndex}>
                                    Index
                                </Button>
                            )}
                        </div>
                    </div>
                    <div className="flex justify-between items-center">
                        <span className="text-default-400 text-small">Total {pagination?.total_count} entries</span>
                    </div>
                </div>
            )}
            <div className="mt-2 flow-root">
                <div className="-mx-4 -my-2 overflow-x-auto sm:-mx-6 lg:-mx-8">
                    <div className="inline-block min-w-full py-2 align-middle sm:px-6 lg:px-8">
                        <div className="overflow-hidden shadow ring-1 ring-black ring-opacity-5 sm:rounded-lg">
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
                <SlideOver className="bg-default-50" isOpen={state.isOpen} title="Add New" onClose={closeSlideOver}>
                    {state.isOpen && formWithHandler}
                </SlideOver>
            )}
        </React.Fragment>
    );
};

export { Table };
