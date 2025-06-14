"use client";

import React from "react";

import { type Pag as PaginationType } from "@/schemas/common";
import {
    Pagination,
    PaginationContent,
    PaginationEllipsis,
    PaginationItem,
    PaginationLink,
    PaginationNext,
    PaginationPrevious,
} from "@/components/ui/pagination";
import { useUpdateQuery } from "@/lib/hooks/useUpdateQuery";

interface Props {
    pagination: PaginationType;
    range?: number; // how many pages before/after the current page
}

const PaginationUI: React.FC<Props> = ({ pagination, range = 2 }) => {
    const { updateQuery } = useUpdateQuery(200);
    const page = pagination?.page ?? 1;
    const totalPages = pagination?.total_pages ?? 1;

    const onNextPage = () => {
        updateQuery([{ key: "page", value: `${page + 1}` }]);
    };

    const onPreviousPage = () => {
        updateQuery([{ key: "page", value: `${page - 1}` }]);
    };

    const onPageChange = (pageNum: number) => {
        updateQuery([{ key: "page", value: pageNum.toString() }]);
    };

    const renderPage = (p: number) => (
        <PaginationItem key={p}>
            <PaginationLink className="cursor-pointer" isActive={page === p} onClick={() => onPageChange(p)}>
                {p}
            </PaginationLink>
        </PaginationItem>
    );

    const renderPages = () => {
        const pages: React.ReactNode[] = [];
        const start = Math.max(2, page - range);
        const end = Math.min(totalPages - 1, page + range);

        // Always show first page
        pages.push(renderPage(1));

        if (start > 2) {
            pages.push(
                <PaginationItem key="ellipsis-start">
                    <PaginationEllipsis />
                </PaginationItem>
            );
        }

        for (let i = start; i <= end; i++) {
            pages.push(renderPage(i));
        }

        if (end < totalPages - 1) {
            pages.push(
                <PaginationItem key="ellipsis-end">
                    <PaginationEllipsis />
                </PaginationItem>
            );
        }

        if (totalPages > 1) {
            pages.push(renderPage(totalPages));
        }

        return pages;
    };

    const renderCompact = () => (
        <>
            <PaginationItem>
                <PaginationPrevious disabled={page === 1} onClick={onPreviousPage} />
            </PaginationItem>

            <PaginationItem>
                <PaginationLink isActive>{page}</PaginationLink>
            </PaginationItem>

            <PaginationItem>
                <PaginationNext disabled={page === totalPages} onClick={onNextPage} />
            </PaginationItem>
        </>
    );

    return (
        <Pagination className="mt-4">
            <PaginationContent>
                {/* Mobile view */}
                <div className="flex sm:hidden">{renderCompact()}</div>

                {/* Desktop view */}
                <div className="hidden sm:flex">
                    <PaginationItem>
                        <PaginationPrevious disabled={page === 1} onClick={onPreviousPage} />
                    </PaginationItem>

                    {renderPages()}

                    <PaginationItem>
                        <PaginationNext disabled={page === totalPages} onClick={onNextPage} />
                    </PaginationItem>
                </div>
            </PaginationContent>
        </Pagination>
    );
};

export default PaginationUI;
