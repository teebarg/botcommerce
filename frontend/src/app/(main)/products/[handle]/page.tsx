import { Metadata } from "next";
import { notFound } from "next/navigation";
import { getProductByHandle, getProductsList, getRegion, listRegions, retrievePricedProductById } from "@lib/data";
import ProductTemplate from "@modules/products/templates";

type Props = {
    params: { countryCode: string; handle: string };
};

export async function generateStaticParams() {
    const countryCodes = await listRegions().then((regions: any) => regions?.map((r) => r.countries.map((c) => c.iso_2)).flat());

    if (!countryCodes) {
        return null;
    }

    const products = await Promise.all(
        countryCodes.map((countryCode: any) => {
            return getProductsList({ countryCode });
        })
    ).then((responses: any) => responses.map(({ response }: any) => response.products).flat());

    const staticParams = countryCodes
        ?.map((countryCode: any) =>
            products.map((product: any) => ({
                countryCode,
                handle: product.handle,
            }))
        )
        .flat();

    return staticParams;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
    const { handle } = params;

    const { product } = await getProductByHandle(handle).then((product: any) => product);

    if (!product) {
        notFound();
    }

    return {
        title: `${product.title} | TBO Store`,
        description: `${product.title}`,
        openGraph: {
            title: `${product.title} | TBO Store`,
            description: `${product.title}`,
            images: product.thumbnail ? [product.thumbnail] : [],
        },
    };
}

const getPricedProductByHandle = async (handle: string, region: any) => {
    const { product } = await getProductByHandle(handle).then((product: any) => product);

    if (!product || !product.id) {
        return null;
    }

    const pricedProduct = await retrievePricedProductById({
        id: product.id,
        regionId: region.id,
    });

    return pricedProduct;
};

export default async function ProductPage({ params }: Props) {
    const region = await getRegion(process.env.NEXT_PUBLIC_COUNTRY_CODE || "ng");

    if (!region) {
        notFound();
    }

    const pricedProduct = await getPricedProductByHandle(params.handle, region);

    if (!pricedProduct) {
        notFound();
    }

    return <ProductTemplate countryCode={process.env.NEXT_PUBLIC_COUNTRY_CODE || "ng"} product={pricedProduct} region={region} />;
}
