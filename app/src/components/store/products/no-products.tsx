import { Home, PackageSearch, RefreshCcw } from "lucide-react";

import { Button } from "@/components/ui/button";
import { useCollections } from "@/hooks/useCollection";
import { Collection } from "@/schemas/product";
import { BtnLink } from "@/components/ui/btnLink";
import { Separator } from "@/components/ui/separator";

const NoProductsFound = ({ searchQuery = "", onClearSearch = () => {}, onGoHome = () => {} }) => {
    const { data: collections } = useCollections();

    return (
        <div className="min-h-[400px] w-full flex flex-col items-center justify-center px-4 py-8">
            <div className="relative mb-6">
                <div className="absolute inset-0 bg-blue-100 rounded-full opacity-20 animate-ping" />
                <div className="relative">
                    <PackageSearch className="w-16 h-16 text-primary" strokeWidth={1.5} />
                </div>
            </div>

            <div className="text-center max-w-md mx-auto">
                <h2 className="text-2xl font-bold">No Products Found</h2>

                {searchQuery && (
                    <p className="text-muted-foreground mb-2">
                        {`We couldn't find any products matching`}
                        <span className="font-medium text-foreground mx-1">{`"${searchQuery}"`}</span>
                    </p>
                )}

                <p className="text-muted-foreground mb-6 text-sm">Try adjusting your search or browse our suggested categories below.</p>

                <div className="flex flex-wrap justify-center gap-3 mb-8">
                    <Button aria-label="clear search" startContent={<RefreshCcw className="w-4 h-4" />} onClick={onClearSearch}>
                        Clear Search
                    </Button>

                    <Button aria-label="home" startContent={<Home className="w-4 h-4" />} variant="outline" onClick={onGoHome}>
                        Go Home
                    </Button>
                </div>

                <div className="space-y-4">
                    <h3 className="text-sm font-semibold">Popular Categories</h3>

                    <div className="flex flex-wrap justify-center gap-2">
                        {collections?.slice(0, 4).map((collection: Collection, idx: number) => (
                            <BtnLink key={idx} aria-label={collection.name} href={`/collections/${collection.name}`}>
                                {collection.name}
                            </BtnLink>
                        ))}
                    </div>
                </div>

                <Separator />
                <div className="mt-8 pt-6">
                    <h3 className="text-sm font-semibold mb-3">Search Tips</h3>
                    <ul className="text-sm text-muted-foreground space-y-2">
                        <li>• Check for spelling mistakes</li>
                        <li>• Try using more general keywords</li>
                        <li>• Browse by category instead</li>
                        <li>• Consider similar terms</li>
                    </ul>
                </div>
            </div>
        </div>
    );
};

export default NoProductsFound;
