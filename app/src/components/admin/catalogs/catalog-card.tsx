import { Eye, Package, Calendar } from "lucide-react";
import { SocialShare } from "./social-share";
import { CatalogActions } from "./catalog-actions";
import type { DBCatalog } from "@/schemas";
import { formatDate } from "@/utils";

export const CatalogCard: React.FC<{ catalog: DBCatalog }> = ({ catalog }) => (
    <div className="bg-card rounded-2xl border border-border">
        <div className="p-4">
            <div className="flex items-start justify-between gap-4 mb-2">
                <h3 className="min-w-0 text-sm font-medium truncate">{catalog.title}</h3>
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

        <div className="border-t border-border px-5 py-2.5 bg-muted/50 flex items-center justify-between">
            <SocialShare catalog={catalog} />
            <CatalogActions item={catalog} />
        </div>
    </div>
);