import { createFileRoute, Outlet } from "@tanstack/react-router";
import { useRef } from "react";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { FilterSidebarLogic } from "@/components/store/catalog/filter-sidebar-logic";

export const Route = createFileRoute("/_mainLayout/collections/__layout")({
    component: RouteComponent,
});

interface FilterSidebarHandle {
    clear: () => void;
    apply: () => void;
}

function RouteComponent() {
    const sidebarRef = useRef<FilterSidebarHandle>(null);

    return (
        <div className="max-w-9xl mx-auto w-full py-4 px-2 slide-in">
            <div className="flex gap-6">
                <aside className="h-[calc(100vh-6rem)] w-80 hidden md:flex flex-col overflow-hidden sticky top-24">
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
                    <Outlet />
                </main>
            </div>
        </div>
    );
}