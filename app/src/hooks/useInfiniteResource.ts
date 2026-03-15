import { useInfiniteQuery } from "@tanstack/react-query";

interface InfiniteResourceOptions<TData, TItem> {
    queryKey: unknown[];
    queryFn: (cursor?: string) => Promise<TData>;
    getItems: (data: TData) => TItem[];
    getNextCursor: (data: TData) => string | undefined | null;
    initialData?: TData;
    staleTime?: number;
}

export function useInfiniteResource<TData, TItem>({
    queryKey,
    queryFn,
    getItems,
    getNextCursor,
    initialData,
    staleTime = 1000 * 60 * 30,
}: InfiniteResourceOptions<TData, TItem>) {
    const query = useInfiniteQuery<TData>({
        queryKey,
        queryFn: ({ pageParam }) => queryFn(pageParam as string | undefined),
        initialPageParam: undefined,
        getNextPageParam: (lastPage) => getNextCursor(lastPage) ?? undefined,
        staleTime,
        refetchOnMount: false,
        initialData: initialData
            ? {
                  pages: [initialData],
                  pageParams: [undefined],
              }
            : undefined,
        initialDataUpdatedAt: initialData ? Date.now() : undefined,
    });

    const items = query.data?.pages.flatMap((page) => getItems(page)) ?? [];

    return {
        ...query,
        items,
    };
}
