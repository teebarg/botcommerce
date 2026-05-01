import { useRef } from "react";
import { useSearch } from "@tanstack/react-router";
import { FilterSidebarLogic, FilterSidebarRef } from "../catalog/filter-sidebar-logic";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";
import InfiniteFeed from "./infinite-feed";

interface Props {
    collection_slug?: string;
    searchTerm?: string;
    initialData: any;
}

export default function InfiniteScrollClient({ initialData, collection_slug, searchTerm }: Props) {
    const sidebarRef = useRef<FilterSidebarRef>(null);
    const search = useSearch({
        strict: false,
    });

    return (
        <div className="max-w-8xl mx-auto w-full py-4 px-2">
            <div className="flex gap-6">
                <aside className="h-[calc(100vh-6rem)] w-96 hidden md:flex flex-col overflow-hidden sticky top-24">
                    <div className="flex items-center justify-between w-full">
                        <h2 className="font-semibold">FILTER & SORT</h2>
                        <Button
                            className="text-primary px-0 justify-end hover:bg-transparent"
                            variant="ghost"
                            onClick={() => sidebarRef.current?.clear()}
                        >
                            Clear All
                        </Button>
                    </div>
                    <ScrollArea className="flex-1 px-2">
                        <FilterSidebarLogic ref={sidebarRef} />
                    </ScrollArea>
                    <div className="flex justify-center gap-2 p-4 mt-2 border-t border-border">
                        <Button className="w-full rounded-full py-6" onClick={() => sidebarRef.current?.apply()}>
                            Apply
                        </Button>
                        <Button className="w-full rounded-full py-6" variant="destructive" onClick={() => sidebarRef.current?.clear()}>
                            Clear
                        </Button>
                    </div>
                </aside>
                <main className="w-full flex-1 relative px-1 rounded-xl">
                    <InfiniteFeed initialData={initialData} params={{
                        ...search,
                        collections: collection_slug,
                        search: searchTerm,
                    }} />
                </main>
            </div>
        </div>
    );
}
