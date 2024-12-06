import LocalizedClientLink from "@modules/common/components/localized-client-link";

export type ProductHit = {
    id: string;
    name: string;
    slug: string;
    description: string | null;
    image: string | null;
    variants: any[];
    collection_handle: string | null;
    collection_id: string | null;
};

type HitProps = {
    hit: ProductHit;
};

const Hit = ({ hit }: HitProps) => {
    return (
        <LocalizedClientLink className="block h-full" data-testid="search-result" href={`/products/${hit.slug}`}>
            <div key={hit.id}>
                <div className="relative">
                    <div className="relative h-72 w-full overflow-hidden rounded-lg">
                        <img alt={hit.name} className="h-full w-full object-cover object-center" src={hit.image as string} />
                    </div>
                    <div className="relative mt-4">
                        <span className="font-medium text-default-900 text-base line-clamp-2">{hit.name}</span>
                        <p className="text-left text-small text-default-500 truncate mt-1">{hit.description}</p>
                    </div>
                    <div className="absolute inset-x-0 top-0 flex h-72 items-end justify-end overflow-hidden rounded-lg p-4">
                        <div aria-hidden="true" className="absolute inset-x-0 bottom-0 h-36 bg-gradient-to-t from-default-500 opacity-50" />
                    </div>
                </div>
            </div>
        </LocalizedClientLink>
    );
};

export default Hit;
