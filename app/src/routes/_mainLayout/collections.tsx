import { createFileRoute, Outlet } from "@tanstack/react-router";
import { useRef } from "react";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { FilterSidebarLogic, FilterSidebarRef } from "@/components/store/catalog/filter-sidebar-logic";
import FilterChips from "@/components/store/collections/filter-chips";

export const Route = createFileRoute('/_mainLayout/collections')({
  component: RouteComponent,
})

function RouteComponent() {
  const sidebarRef = useRef<FilterSidebarRef>(null);

  return (
    <div className="max-w-8xl mx-auto w-full py-2 px-1">
      <div className="flex gap-6">
        <aside className="h-[calc(100vh-6rem)] w-80 hidden md:flex flex-col overflow-hidden sticky top-24">
          <div className="w-full pb-2">
            <h2 className="font-semibold">FILTER & SORT</h2>
          </div>
          <ScrollArea className="flex-1 px-2 py-2">
            <FilterSidebarLogic ref={sidebarRef} />
          </ScrollArea>
          <div className="p-4 border-t border-border space-y-2">
            <Button className="w-full rounded-full" onClick={() => sidebarRef.current?.apply()}>
              Apply filters
            </Button>
            <Button className="w-full rounded-full" variant="ghost" onClick={() => sidebarRef.current?.clear()}>
              Clear all
            </Button>
          </div>
        </aside>
        <main className="w-full flex-1 relative px-1 rounded-xl">
          <FilterChips value="for-you" />
          <Outlet />
        </main>
      </div>
    </div>
  );
}