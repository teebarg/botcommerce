import { Eye, Calendar, Package, Edit } from "lucide-react";
import Image from "next/image";

import { SocialShare } from "./social-share";
import { SharedActions } from "./shared-actions";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Shared } from "@/schemas";
import { formatDate } from "@/lib/utils";

export const SharedCard: React.FC<{ collection: Shared }> = ({ collection }) => (
    <Card className="group hover:shadow-lg transition-all duration-200 border-border bg-card">
        <CardHeader className="pb-3">
            <div className="flex items-start justify-between">
                <div className="space-y-1 flex-1">
                    <CardTitle className="text-lg font-semibold text-foreground group-hover:text-primary transition-colors">
                        {collection.title}
                    </CardTitle>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <span className="font-mono bg-muted px-2 py-1 rounded text-xs">/{collection.slug}</span>
                        <Badge className="text-xs" variant={collection.is_active ? "default" : "destructive"}>
                            {collection.is_active ? "Active" : "Inactive"}
                        </Badge>
                    </div>
                </div>
                <SocialShare collection={collection} />
            </div>
            {collection.description && <p className="text-sm text-muted-foreground mt-2">{collection.description}</p>}
        </CardHeader>
        <CardContent className="pt-0">
            <div className="space-y-4">
                <div className="flex items-center justify-between text-sm">
                    <div className="flex items-center gap-4">
                        <div className="flex items-center gap-1 text-default-500">
                            <Eye className="h-4 w-4" />
                            <span>{collection.view_count} views</span>
                        </div>
                        <div className="flex items-center gap-1 text-default-500">
                            <Calendar className="h-4 w-4" />
                            <span>{formatDate(collection.created_at)}</span>
                        </div>
                    </div>
                </div>

                <div className="space-y-3">
                    <div className="flex items-center justify-between">
                        <span className="text-sm font-medium text-foreground flex items-center gap-2">
                            <Package className="h-4 w-4" />
                            Products ({collection.products.length})
                        </span>
                    </div>

                    {collection.products.length > 0 ? (
                        <div className="space-y-3">
                            <div className="flex gap-2">
                                {collection.products.slice(0, 4).map((product) => (
                                    <div key={product.id} className="relative w-24 h-24 rounded bg-content3 overflow-hidden p-2">
                                        <Image
                                            fill
                                            alt={product.name}
                                            className="object-contain"
                                            src={product.images[0] || product.image || "/placeholder.jpg"}
                                        />
                                    </div>
                                ))}
                            </div>

                            {collection.products.length > 4 && (
                                <div className="flex items-center justify-center bg-muted/30 rounded-lg p-3 text-sm text-default-500 border border-dashed border-border">
                                    <Package className="h-4 w-4 mr-2" />+{collection.products.length - 4} more products
                                </div>
                            )}
                        </div>
                    ) : (
                        <div className="flex items-center justify-center bg-muted/30 rounded-lg p-4 text-sm text-default-500">
                            <Package className="h-4 w-4 mr-2" />
                            No products yet
                        </div>
                    )}
                </div>

                <SharedActions item={collection} />

                <div className="flex gap-2 pt-2">
                    <Button className="flex-1" variant="outline">
                        <Edit className="h-4 w-4 mr-2" />
                        Edit
                    </Button>
                    <Button className="flex-1" variant="default">
                        <Eye className="h-4 w-4 mr-2" />
                        View
                    </Button>
                </div>
            </div>
        </CardContent>
    </Card>
);
