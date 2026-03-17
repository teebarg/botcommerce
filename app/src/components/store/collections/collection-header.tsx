import { Badge } from "@/components/ui/badge";
import { useCollections } from "@/hooks/useCollection";
import ShareButton from "@/components/share";
import { useNavigate } from "@tanstack/react-router";

export function CollectionHeader() {
    const { data: collections } = useCollections();
    const navigate = useNavigate();

    return (
        <div className="flex justify-between items-center py-2">
            <div className="flex flex-wrap gap-2">
                {collections?.map((collection) => (
                    <Badge
                        key={collection.id}
                        className="cursor-pointer py-1 text-sm"
                        // variant={params.slug === collection.slug ? "indigo" : "gray"}
                        onClick={() => navigate({ to: `/collections/${collection.slug}` })}
                    >
                        {collection.name}
                    </Badge>
                ))}
            </div>
            <ShareButton />
        </div>
    );
}
