import { Eye } from "lucide-react";

import { SocialShare } from "./social-share";
import { SharedActions } from "./shared-actions";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { DBCatalog } from "@/schemas";

export const SharedCard: React.FC<{ catalog: DBCatalog }> = ({ catalog }) => (
    <Card className="group hover:shadow-lg transition-all duration-200 border-border bg-card">
        <CardHeader className="pb-3">
            <div className="flex items-start justify-between">
                <div className="space-y-1 flex-1">
                    <CardTitle className="text-lg font-semibold text-foreground group-hover:text-primary transition-colors">
                        {catalog.title}
                    </CardTitle>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <span className="font-mono bg-muted px-2 py-1 rounded text-xs">/{catalog.slug}</span>
                        <Badge className="text-xs" variant={catalog.is_active ? "emerald" : "destructive"}>
                            {catalog.is_active ? "Active" : "Inactive"}
                        </Badge>
                    </div>
                </div>
                <SocialShare catalog={catalog} />
            </div>
            {catalog.description && <p className="text-sm text-muted-foreground mt-2">{catalog.description}</p>}
        </CardHeader>
        <CardContent className="pt-0">
            <div className="space-y-4">
                <div className="flex items-center justify-between text-sm">
                    <div className="flex items-center gap-4">
                        <div className="flex items-center gap-1 text-default-500">
                            <Eye className="h-4 w-4" />
                            <span>{catalog.view_count} views</span>
                        </div>
                        {/* <div className="flex items-center gap-1 text-default-500">
                            <Calendar className="h-4 w-4" />
                            <span>{formatDate(catalog.created_at)}</span>
                        </div> */}
                    </div>
                </div>

                {/* <div className="space-y-3">
                    <div className="flex items-center justify-between">
                        <span className="text-sm font-medium text-foreground flex items-center gap-2">
                            <Package className="h-4 w-4" />
                            Products ({catalog.products_count})
                        </span>
                    </div>
                </div> */}

                <SharedActions item={catalog} />
            </div>
        </CardContent>
    </Card>
);
