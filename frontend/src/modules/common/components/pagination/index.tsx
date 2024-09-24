"use client";

import React from "react";
import { Pagination as Pag } from "@nextui-org/pagination";
import { useUpdateQuery } from "@lib/hooks/useUpdateQuery";
import { Pagination as PaginationType } from "types/global";

import Button from "../button";

interface Props {
    pagination: PaginationType;
}

const Pagination: React.FC<Props> = ({ pagination }) => {
    const { updateQuery } = useUpdateQuery();

    const page = pagination?.page ?? 1;

    const onNextPage = React.useCallback(() => {
        updateQuery([{ key: "page", value: `${page + 1}` }]);
    }, [page, updateQuery]);

    const onPreviousPage = React.useCallback(() => {
        updateQuery([{ key: "page", value: `${page - 1}` }]);
    }, [page, updateQuery]);

    const onPageChange = React.useCallback(
        (page: number) => {
            updateQuery([{ key: "page", value: page.toString() }]);
        },
        [updateQuery]
    );

    return (
        <div className="py-2 px-2 flex justify-between items-center mt-4">
            <div className="w-[30%]" />
            <Pag
                showControls
                classNames={{
                    cursor: "bg-foreground text-background",
                }}
                color="default"
                isDisabled={false}
                page={page}
                total={pagination?.total_pages ?? 1}
                variant="light"
                onChange={onPageChange}
            />
            <div className="hidden sm:flex w-[30%] justify-end gap-2">
                <Button disabled={pagination?.total_pages === 1 || page == 1} size="sm" variant="flat" onClick={onPreviousPage}>
                    Previous
                </Button>
                <Button disabled={pagination?.total_pages === 1 || page == pagination?.total_pages} size="sm" variant="flat" onClick={onNextPage}>
                    Next
                </Button>
            </div>
        </div>
    );
};

export { Pagination };
