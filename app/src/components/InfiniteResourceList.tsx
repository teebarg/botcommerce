import { InfiniteScroll } from "@/components/InfiniteScroll";

interface Props<T> {
    items: T[];
    renderItem: (item: T, index: number) => React.ReactNode;
    onLoadMore: () => void;
    hasMore: boolean;
    isLoading: boolean;
    loader?: React.ReactNode;
}

export function InfiniteResourceList<T>({ items, renderItem, onLoadMore, hasMore, isLoading, loader }: Props<T>) {
    return (
        <InfiniteScroll onLoadMore={onLoadMore} hasMore={hasMore} isLoading={isLoading} loader={loader}>
            <div className="space-y-2 md:space-y-0">{items.map((item, index) => renderItem(item, index))}</div>
        </InfiniteScroll>
    );
}
