import { lazy, Suspense } from "react";
import { Search } from "lucide-react";
import { useOverlayTriggerState } from "react-stately";
import { Sheet, SheetTrigger } from "@/components/ui/sheet";

const SearchDialogContent = lazy(() => import("./search-dialog-content"));

export const SearchDialog = () => {
  const searchState = useOverlayTriggerState({});

  return (
    <Sheet open={searchState.isOpen} onOpenChange={searchState.toggle}>
      <SheetTrigger asChild>
        <button type="button" className="text-left block cursor-pointer">
          <div className="bg-card rounded-2xl hidden md:flex items-center gap-1.5 w-96 px-2 py-3">
            <Search className="w-5 h-5 text-muted-foreground" />
            <span className="text-foreground text-sm">Search for products...</span>
          </div>
          <div className="rounded-md md:hidden h-10 w-10 flex items-center justify-center">
            <Search className="w-6 h-6" />
            <span className="sr-only">Search</span>
          </div>
        </button>
      </SheetTrigger>

      {searchState.isOpen && (
        <Suspense fallback={null}>
          <SearchDialogContent
            isOpen={searchState.isOpen}
            close={searchState.close}
          />
        </Suspense>
      )}
    </Sheet>
  );
};
