import { useInfiniteQuery, UseInfiniteQueryOptions } from "@tanstack/react-query";

interface InfiniteResourceOptions<TData, TItem> {
    queryKey: unknown[];
    queryFn: (cursor?: string) => Promise<TData>;
    getItems: (data: TData) => TItem[];
    getNextCursor: (data: TData) => string | undefined | null;
    initialData?: TData;
}

export function useInfiniteResource<TData, TItem>({
    queryKey,
    queryFn,
    getItems,
    getNextCursor,
    initialData,
}: InfiniteResourceOptions<TData, TItem>) {
    const query = useInfiniteQuery<TData>({
        queryKey,
        queryFn: ({ pageParam }) => queryFn(pageParam as string | undefined),
        initialPageParam: undefined,
        getNextPageParam: (lastPage) => getNextCursor(lastPage) ?? undefined,
        initialData: initialData
            ? {
                  pages: [initialData],
                  pageParams: [undefined],
              }
            : undefined,
    });

    const items = query.data?.pages.flatMap((page) => getItems(page)) ?? [];

    return {
        ...query,
        items,
    };
}
