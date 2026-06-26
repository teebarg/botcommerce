import { Eye, Package, Calendar } from "lucide-react";
import { SocialShare } from "./social-share";
import { CatalogActions } from "./catalog-actions";
import type { DBCatalog } from "@/schemas";
import { formatDate } from "@/utils";

export const CatalogCard: React.FC<{ catalog: DBCatalog }> = ({ catalog }) => (
    <div className="bg-card rounded-2xl border border-border overflow-hidden">
        <div className="px-5 pt-5 pb-4">
            <div className="flex items-start justify-between gap-4 mb-2">
                <div className="min-w-0">
                    <p className="text-xs font-medium tracking-widest uppercase text-muted-foreground mb-1 truncate">
                        /{catalog.slug}
                    </p>
                    <h3 className="text-sm font-medium truncate">{catalog.title}</h3>
                </div>
                <span className={`shrink-0 text-xs font-medium px-2 py-0.5 rounded-full ${catalog.is_active
                        ? "bg-success text-success-foreground"
                        : "bg-muted text-muted-foreground"
                    }`}>
                    {catalog.is_active ? "Active" : "Inactive"}
                </span>
            </div>
            {catalog.description && (
                <p className="text-sm text-muted-foreground leading-relaxed">{catalog.description}</p>
            )}
        </div>

        <div className="border-t border-border px-5 py-3 flex items-center gap-4">
            <span className="flex items-center gap-1.5 text-xs text-muted-foreground">
                <Eye className="h-3.5 w-3.5" />
                {catalog.view_count} views
            </span>
            <span className="flex items-center gap-1.5 text-xs text-muted-foreground">
                <Package className="h-3.5 w-3.5" />
                {catalog.products_count} products
            </span>
            <span className="flex items-center gap-1.5 text-xs text-muted-foreground">
                <Calendar className="h-3.5 w-3.5" />
                {formatDate(catalog.created_at)}
            </span>
        </div>

        <div className="border-t border-border px-5 py-3 bg-muted/50 flex items-center justify-between">
            <SocialShare catalog={catalog} />
            <CatalogActions item={catalog} />
        </div>
    </div>
);