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
import { useUpdateQuery } from "@/hooks/useUpdateQuery";

interface Props {
    pagination: PaginationType;
    range?: number;
}

const PaginationUI: React.FC<Props> = ({ pagination, range = 2 }) => {
    console.log("🚀 ~ file: pagination.tsx:21 ~ pagination:", pagination)
    const { updateQuery } = useUpdateQuery(200);
    const page = (pagination?.skip ?? 0) / (pagination?.limit ?? 1) + 1;
    const totalPages = pagination?.total_pages ?? 1;

    const onNextPage = () => {
        updateQuery([{ key: "skip", value: `${page * pagination?.limit}` }]);
    };

    const onPreviousPage = () => {
        updateQuery([{ key: "skip", value: `${(page - 1) * pagination?.limit}` }]);
    };

    const onPageChange = (pageNum: number) => {
        updateQuery([{ key: "skip", value: `${(pageNum - 1) * pagination?.limit}` }]);
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
