import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useBulkAddProductsToCatalog, useCatalogs } from "@/hooks/useCollection";
import type { Shared } from "@/schemas";

interface CatalogBulkProductUpdateProps {
    selectedCount: number;
    selectedImageIds: number[];
    selectedProductIds?: number[];
    onClose: () => void;
}

const CatalogItem: React.FC<{ catalog: Shared; selectedProductIds: number[] }> = ({ catalog, selectedProductIds }) => {
    const { mutateAsync: bulkAddToCatalog, isPending: isAdding } = useBulkAddProductsToCatalog();

    return (
        <Card key={catalog.id} className="border">
            <CardHeader className="py-3">
                <CardTitle className="text-sm font-medium flex items-center justify-between">
                    <span>
                        {catalog.title} ({catalog.products_count})
                    </span>
                    <Badge className="text-xs" variant={catalog.is_active ? "emerald" : "destructive"}>
                        {catalog.is_active ? "Active" : "Inactive"}
                    </Badge>
                </CardTitle>
            </CardHeader>
            <CardContent className="pt-0 pb-3">
                <Button
                    disabled={!catalog.is_active || isAdding || selectedProductIds.length === 0}
                    isLoading={isAdding}
                    size="sm"
                    onClick={async () => {
                        await bulkAddToCatalog({ collectionId: catalog.id, productIds: selectedProductIds });
                    }}
                >
                    Add {selectedProductIds.length} product(s)
                </Button>
            </CardContent>
        </Card>
    );
};

export const CatalogBulkProductUpdate = ({ selectedProductIds = [], onClose }: CatalogBulkProductUpdateProps) => {
    const { data: sharedCollections } = useCatalogs(true);

    return (
        <div className="flex-1 overflow-hidden flex flex-col">
            <p className="text-sm text-muted-foreground mb-3 mx-2">Select a catalog to add {selectedProductIds.length} product(s).</p>
            <ScrollArea className="flex-1 px-2">
                <div className="space-y-2">
                    {sharedCollections?.shared?.map((collection: any) => (
                        <CatalogItem key={collection.id} catalog={collection} selectedProductIds={selectedProductIds} />
                    ))}
                </div>
            </ScrollArea>
            <div className="sheet-footer">
                <Button variant="destructive" onClick={onClose}>
                    Close
                </Button>
            </div>
        </div>
    );
};
