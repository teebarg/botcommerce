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

    console.log(page);
    console.log(pagination?.total_pages);

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
            <React.Fragment>
                <nav
                    role="navigation"
                    aria-label="pagination navigation"
                    data-slot="base"
                    dataControls="true"
                    dataDotsJump="5"
                    dataTotal="4"
                    dataActivePage="1"
                    className="p-2.5 -m-2.5 overflow-x-scroll scrollbar-hide"
                >
                    <ul data-slot="wrapper" className="flex flex-nowrap h-fit max-w-fit relative gap-1 items-center overflow-visible rounded-medium">
                        <span
                            aria-hidden="true"
                            data-slot="cursor"
                            className="absolute flex overflow-visible items-center justify-center origin-center left-0 select-none touch-none pointer-events-none z-20 data-[moving=true]:transition-transform !data-[moving=true]:duration-300 opacity-0 data-[moving]:opacity-100 min-w-9 w-9 h-9 text-small rounded-medium bg-foreground text-background"
                            dataMoving="false"
                            style={{ transform: "translateX(40px) scale(1)" }}
                        >
                            11
                        </span>
                        <li
                            role="button"
                            aria-label="previous page button"
                            aria-disabled={pagination?.total_pages === 1 || page == 1 ? "true" : "false"}
                            data-disabled={pagination?.total_pages === 1 || page == 1 ? "true" : "false"}
                            data-slot="prev"
                            className="flex flex-wrap truncate box-border items-center justify-center text-default-foreground outline-none data-[focus-visible=true]:z-10 data-[focus-visible=true]:outline-2 data-[focus-visible=true]:outline-focus data-[focus-visible=true]:outline-offset-2 data-[disabled=true]:text-default-300 data-[disabled=true]:pointer-events-none [&[data-hover=true]:not([data-active=true])]:bg-default-100 active:bg-default-200 min-w-9 w-9 h-9 text-small rounded-medium"
                        >
                            <svg aria-hidden="true" fill="none" focusable="false" height="1em" role="presentation" viewBox="0 0 24 24" width="1em">
                                <path d="M15.5 19l-7-7 7-7" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" />
                            </svg>
                        </li>
                        {Array.from({ length: pagination?.total_pages }).map((_, index: number) => (
                            <li
                                key={index}
                                role="button"
                                aria-label={`pagination item ${index + 1} ${page == index + 1 ? "active" : ""}`}
                                ariacurrent={page == index + 1 ? "true" : "false"}
                                dataactive={page == index + 1 ? "true" : "false"}
                                data-slot="item"
                                className="tap-highlight-transparent select-none touch-none bg-transparent data-[pressed=true]:scale-[0.97] transition-transform-background flex flex-wrap truncate box-border items-center justify-center text-default-foreground outline-none data-[focus-visible=true]:z-10 data-[focus-visible=true]:outline-2 data-[focus-visible=true]:outline-focus data-[focus-visible=true]:outline-offset-2 data-[disabled=true]:text-default-300 data-[disabled=true]:pointer-events-none [&[data-hover=true]:not([data-active=true])]:bg-default-100 active:bg-default-200 min-w-9 w-9 h-9 text-small rounded-medium"
                            >
                                {index + 1}
                            </li>
                        ))}
                        {/* <li
                            role="button"
                            aria-label="pagination item 1 active"
                            ariaCurrent="true"
                            dataActive="true"
                            data-slot="item"
                            className="tap-highlight-transparent select-none touch-none bg-transparent data-[pressed=true]:scale-[0.97] transition-transform-background flex flex-wrap truncate box-border items-center justify-center text-default-foreground outline-none data-[focus-visible=true]:z-10 data-[focus-visible=true]:outline-2 data-[focus-visible=true]:outline-focus data-[focus-visible=true]:outline-offset-2 data-[disabled=true]:text-default-300 data-[disabled=true]:pointer-events-none [&[data-hover=true]:not([data-active=true])]:bg-default-100 active:bg-default-200 min-w-9 w-9 h-9 text-small rounded-medium"
                        >
                            12
                        </li>
                        <li
                            role="button"
                            aria-label="pagination item 2"
                            data-slot="item"
                            className="tap-highlight-transparent select-none touch-none bg-transparent data-[pressed=true]:scale-[0.97] transition-transform-background flex flex-wrap truncate box-border items-center justify-center text-default-foreground outline-none data-[focus-visible=true]:z-10 data-[focus-visible=true]:outline-2 data-[focus-visible=true]:outline-focus data-[focus-visible=true]:outline-offset-2 data-[disabled=true]:text-default-300 data-[disabled=true]:pointer-events-none [&[data-hover=true]:not([data-active=true])]:bg-default-100 active:bg-default-200 min-w-9 w-9 h-9 text-small rounded-medium"
                        >
                            2
                        </li>
                        <li
                            role="button"
                            aria-label="pagination item 3"
                            data-slot="item"
                            className="tap-highlight-transparent select-none touch-none bg-transparent data-[pressed=true]:scale-[0.97] transition-transform-background flex flex-wrap truncate box-border items-center justify-center text-default-foreground outline-none data-[focus-visible=true]:z-10 data-[focus-visible=true]:outline-2 data-[focus-visible=true]:outline-focus data-[focus-visible=true]:outline-offset-2 data-[disabled=true]:text-default-300 data-[disabled=true]:pointer-events-none [&[data-hover=true]:not([data-active=true])]:bg-default-100 active:bg-default-200 min-w-9 w-9 h-9 text-small rounded-medium"
                        >
                            3
                        </li>
                        <li
                            role="button"
                            aria-label="pagination item 4"
                            data-slot="item"
                            className="tap-highlight-transparent select-none touch-none bg-transparent data-[pressed=true]:scale-[0.97] transition-transform-background flex flex-wrap truncate box-border items-center justify-center text-default-foreground outline-none data-[focus-visible=true]:z-10 data-[focus-visible=true]:outline-2 data-[focus-visible=true]:outline-focus data-[focus-visible=true]:outline-offset-2 data-[disabled=true]:text-default-300 data-[disabled=true]:pointer-events-none [&[data-hover=true]:not([data-active=true])]:bg-default-100 active:bg-default-200 min-w-9 w-9 h-9 text-small rounded-medium"
                        >
                            4
                        </li> */}
                        <li
                            role="button"
                            aria-label="next page button"
                            data-slot="next"
                            className="flex flex-wrap truncate box-border items-center justify-center text-default-foreground outline-none data-[focus-visible=true]:z-10 data-[focus-visible=true]:outline-2 data-[focus-visible=true]:outline-focus data-[focus-visible=true]:outline-offset-2 data-[disabled=true]:text-default-300 data-[disabled=true]:pointer-events-none [&[data-hover=true]:not([data-active=true])]:bg-default-100 active:bg-default-200 min-w-9 w-9 h-9 text-small rounded-medium"
                        >
                            <svg
                                aria-hidden="true"
                                fill="none"
                                focusable="false"
                                height="1em"
                                role="presentation"
                                viewBox="0 0 24 24"
                                width="1em"
                                className="rotate-180"
                            >
                                <path d="M15.5 19l-7-7 7-7" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" />
                            </svg>
                        </li>
                    </ul>
                </nav>
            </React.Fragment>
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
                <Button isDisabled={pagination?.total_pages === 1 || page == 1} size="sm" variant="flat" onPress={onPreviousPage}>
                    Previous
                </Button>
                <Button isDisabled={pagination?.total_pages === 1 || page == pagination?.total_pages} size="sm" variant="flat" onPress={onNextPage}>
                    Next
                </Button>
            </div>
        </div>
    );
};

export { Pagination };
