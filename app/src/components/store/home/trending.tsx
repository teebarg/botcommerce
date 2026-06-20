import { Link } from "@tanstack/react-router";
import type { ProductSearch } from "@/schemas";
import { currency } from "@/utils";
import { PageLoader } from "@/components/generic/page-loader";

export default function Trending({ products, isLoading }: { products: ProductSearch[], isLoading?: boolean }) {
    if (isLoading) return <PageLoader variant="product-section" />;
    if (!products?.length) return null;

    const [hero, ...rest] = products.slice(0, 5);
    const small = rest.slice(0, 2);
    const extraSmall = rest.slice(2, 4);

    return (
        <section className="py-6 max-w-6xl mx-auto px-2">
            <div className="flex items-center justify-between mb-3">
                <div>
                    <h2 className="font-display text-xl font-semibold">Trending now</h2>
                    <p className="text-xs text-muted-foreground">What everyone's buying</p>
                </div>
                <Link to="/collections/$slug" params={{ slug: "trending" }} className="text-sm text-accent font-medium">
                    See all →
                </Link>
            </div>

            <div className="grid grid-cols-2 lg:grid-cols-3 gap-2">
                <Link
                    to="/collections/$slug"
                    params={{ slug: "trending" }}
                    className="rounded-xl overflow-hidden border border-border bg-card row-span-2 flex flex-col"
                >
                    <div className="flex-1 min-h-0 relative">
                        <img
                            src={hero?.image || "/placeholder.jpg"}
                            alt={hero?.name}
                            className="absolute inset-0 w-full h-full object-cover"
                        />
                    </div>
                    <div className="p-3 shrink-0">
                        <span className="text-xs bg-accent-subtle text-accent-subtle-foreground px-2 py-0.5 rounded-full font-medium">Hot</span>
                        <p className="text-sm font-medium mt-1.5 truncate">{hero?.name}</p>
                        <p className="text-xs text-muted-foreground">{currency(hero?.variants?.[0]?.price ?? 0)}</p>
                    </div>
                </Link>

                {small.map((product) => (
                    <Link
                        key={product.id}
                        to="/collections/$slug"
                        params={{ slug: "trending" }}
                        className="rounded-xl overflow-hidden border border-border bg-card"
                    >
                        <img
                            src={product.image || "/placeholder.jpg"}
                            alt={product.name}
                            className="w-full object-cover aspect-square"
                        />
                        <div className="p-3">
                            <p className="text-xs font-medium truncate">{product.name}</p>
                            <p className="text-xs text-muted-foreground">{currency(product?.variants?.[0]?.price ?? 0)}</p>
                        </div>
                    </Link>
                ))}

                {extraSmall.map((product) => (
                    <Link
                        key={product.id}
                        to="/collections/$slug"
                        params={{ slug: "trending" }}
                        className="hidden lg:block rounded-xl overflow-hidden border border-border bg-card"
                    >
                        <img
                            src={product.image || "/placeholder.jpg"}
                            alt={product.name}
                            className="w-full object-cover aspect-square"
                        />
                        <div className="p-3">
                            <p className="text-xs font-medium truncate">{product.name}</p>
                            <p className="text-xs text-muted-foreground">{currency(product?.variants?.[0]?.price ?? 0)}</p>
                        </div>
                    </Link>
                ))}
            </div>
        </section>
    );
}