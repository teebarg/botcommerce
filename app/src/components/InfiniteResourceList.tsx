import { InfiniteScroll } from "@/components/InfiniteScroll";
import { cn } from "@/utils";

interface Props<T> {
    items: T[];
    renderItem: (item: T, index: number) => React.ReactNode;
    onLoadMore: () => void;
    hasMore: boolean;
    isLoading: boolean;
    loader?: React.ReactNode;
    className?: string;
}

export function InfiniteResourceList<T>({ items, renderItem, onLoadMore, hasMore, isLoading, loader, className }: Props<T>) {
    return (
        <InfiniteScroll onLoadMore={onLoadMore} hasMore={hasMore} isLoading={isLoading} loader={loader}>
            <div className={cn("space-y-2 md:space-y-0", className)}>{items.map((item, index) => renderItem(item, index))}</div>
        </InfiniteScroll>
    );
}
