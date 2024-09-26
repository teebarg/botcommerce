import { Metadata } from "next";
import { notFound } from "next/navigation";
import { getProductBySlug } from "@lib/data";
import ProductTemplate from "@modules/products/templates";
import { getDocuments } from "@lib/util/meilisearch";
import { Product } from "types/global";

type Props = {
    params: { slug: string };
};

export async function generateStaticParams() {
    const {results: products} = await getDocuments("products")

    return products.map((product: Product) => ({
        slug: String(product.slug),
    }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
    const product = await getProductBySlug(params.slug)

    if (!product) {
        notFound();
    }

    return {
        title: `${product.name} | TBO Store`,
        description: `${product.description}`,
        openGraph: {
            title: `${product.name} | TBO Store`,
            description: `${product.description}`,
            images: product.image ? [product.image] : [],
        },
    };
}

export default async function ProductPage({ params }: Props) {
    const product = await getProductBySlug(params.slug)
    if (!product) {
        notFound();
    }

    return <ProductTemplate product={product} />;
}
