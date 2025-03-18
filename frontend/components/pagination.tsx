"use client";

import React from "react";

import { type Pagination as PaginationType } from "@/types/global";
import { Pagination, PaginationContent, PaginationItem, PaginationLink, PaginationNext, PaginationPrevious } from "@/components/ui/pagination";
import { useUpdateQuery } from "@/lib/hooks/useUpdateQuery";

interface Props {
    pagination: PaginationType;
}

const PaginationUI: React.FC<Props> = ({ pagination }) => {
    const { updateQuery } = useUpdateQuery(200);

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
        <Pagination className="mt-4">
            <PaginationContent>
                <PaginationItem>
                    <PaginationPrevious disabled={page === 1} onClick={onPreviousPage} />
                </PaginationItem>
                {Array.from({ length: pagination?.total_pages }).map((_, index: number) => (
                    <PaginationItem key={index}>
                        <PaginationLink className="cursor-pointer" isActive={page === index + 1} onClick={() => onPageChange(index + 1)}>
                            {index + 1}
                        </PaginationLink>
                    </PaginationItem>
                ))}
                <PaginationItem>
                    <PaginationNext disabled={pagination?.total_pages === 1 || page == pagination?.total_pages} onClick={onNextPage} />
                </PaginationItem>
            </PaginationContent>
        </Pagination>
    );
};

export default PaginationUI;
