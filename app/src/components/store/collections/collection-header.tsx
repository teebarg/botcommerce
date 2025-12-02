"use client";

import { useParams, useRouter } from "next/navigation";

import { Badge } from "@/components/ui/badge";
import { useCollections } from "@/lib/hooks/useCollection";
import LocalizedClientLink from "@/components/ui/link";
import ShareButton from "@/components/share";

export function CollectionHeader() {
    const { data: collections } = useCollections();
    const router = useRouter();
    const params = useParams();

    return (
        <div className="flex flex-col gap-3 py-4 px-0.5">
            <div className="flex justify-between items-center">
                <nav className="text-sm">
                    <ol className="flex items-center space-x-2 text-muted-foreground">
                        <li>
                            <LocalizedClientLink className="hover:text-foreground transition-colors" href="/">
                                Home
                            </LocalizedClientLink>
                        </li>
                        <li>/</li>
                        <li className="text-foreground font-medium">Products</li>
                    </ol>
                </nav>
                <ShareButton />
            </div>

            <div className="flex flex-wrap gap-2">
                {collections?.map((collection) => (
                    <Badge
                        key={collection.id}
                        className="cursor-pointer py-1 text-sm"
                        variant={params.slug === collection.slug ? "indigo" : "gray"}
                        onClick={() => router.push(`/collections/${collection.slug}`)}
                    >
                        {collection.name}
                    </Badge>
                ))}
            </div>
        </div>
    );
}
