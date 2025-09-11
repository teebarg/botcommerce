"use client";

import { Badge } from "@/components/ui/badge";
import { useCollections } from "@/lib/hooks/useCollection";
import LocalizedClientLink from "@/components/ui/link";
import { useParams, useRouter } from "next/navigation";

export function CollectionHeader() {
    const { data: collections } = useCollections();
    const router = useRouter();
    const params = useParams();

    return (
        <div className="flex flex-col gap-3 py-4 px-0.5">
            <nav className="text-sm">
                <ol className="flex items-center space-x-2 text-muted-foreground">
                    <li>
                        <LocalizedClientLink href="/" className="hover:text-foreground transition-colors">
                            Home
                        </LocalizedClientLink>
                    </li>
                    <li>/</li>
                    <li className="text-foreground font-medium">Products</li>
                </ol>
            </nav>

            <div className="flex flex-wrap gap-2">
                {collections?.map((collection) => (
                    <Badge
                        onClick={() => router.push(`/collections/${collection.slug}`)}
                        key={collection.id}
                        variant={params.slug === collection.slug ? "indigo" : "gray"}
                        className="cursor-pointer py-1 text-sm"
                    >
                        {collection.name}
                    </Badge>
                ))}
            </div>
        </div>
    );
}
