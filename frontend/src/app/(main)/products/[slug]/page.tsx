import { Metadata } from "next";
import { notFound } from "next/navigation";
import { getProductsList, getProduct, getProducts } from "@lib/data";
import ProductTemplate from "@modules/products/templates";

type Props = {
    params: { slug: string };
};

export async function generateStaticParams() {
    const { products } = await getProductsList({ page: 1, limit: 100000 });

    const staticParams = products
        .map((product: any) => ({
            slug: product.slug,
        }))
        .flat();

    return staticParams;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
    const { slug } = params;

    const { product } = await getProduct(slug);

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
    const { product } = await getProduct(params.slug);

    if (!product) {
        notFound();
    }

    return <ProductTemplate product={product} />;
}
