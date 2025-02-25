import { Metadata } from "next";
import React from "react";
import { Table } from "@modules/common/components/table";
import ProductUpload from "@modules/admin/products/product-upload";
import { currency } from "@lib/util/util";
import { Actions } from "@modules/admin/components/actions";
import { ProductForm } from "@modules/admin/products/product-form";
import { CheckMini } from "nui-react-icons";
import { Avatar } from "@modules/common/components/avatar";

import { siteConfig } from "@/lib/config";
import { Badge } from "@/components/ui/badge";
import { api } from "@/apis";
import { Product } from "@/lib/models";
import ServerError from "@/components/server-error";

export const metadata: Metadata = {
    title: `Children clothing | ${siteConfig.name} Store`,
    description: siteConfig.description,
};

type SearchParams = Promise<{
    page?: string;
    limit?: string;
    search?: string;
}>;

type ProductPageProps = {
    searchParams: SearchParams;
};

export default async function ProductsPage({ searchParams }: ProductPageProps) {
    const { search = "", page: pageStr = "1", limit: limitStr = "10" } = await searchParams;
    const page = parseInt(pageStr, 10);
    const limit = parseInt(limitStr, 10);

    const [productsResponse, brandRes, collectionsRes, catRes, customer] = await Promise.all([
        api.product.search({ query: search, limit, page }),
        api.brand.all(),
        api.collection.all({ page: 1, limit: 100 }),
        api.category.all(),
        api.user.me(),
    ]);

    // Early returns for error handling
    if (!brandRes || !collectionsRes || !catRes) {
        return <ServerError />;
    }

    const { products, ...pagination } = productsResponse;
    const { brands } = brandRes;
    const { collections } = collectionsRes;
    const { categories } = catRes;

    const deleteProduct = async (id: string) => {
        "use server";
        try {
            await api.product.delete(id);
        } catch (error) {
            console.error("Failed to delete draft:", error);
        }
    };

    return (
        <React.Fragment>
            <div>
                <div className="max-w-7xl mx-auto p-8">
                    <h1 className="text-2xl font-semibold mb-2">Products</h1>
                    <div className="py-4">
                        <ProductUpload userId={customer.id} />
                    </div>
                    <Table
                        canExport
                        canIndex
                        columns={["No", "Image", "Name", "Description", "Price", "Old Price", "Created At"]}
                        form={<ProductForm brands={brands} categories={categories} collections={collections} type="create" />}
                        pagination={pagination}
                        searchQuery={search}
                    >
                        {products.map((item: Product, index: number) => (
                            <tr key={item.id} className="even:bg-content2">
                                <td className="whitespace-nowrap py-4 pl-4 pr-3 text-sm font-medium sm:pl-3">{(page - 1) * limit + index + 1}</td>
                                <td className="whitespace-nowrap py-4 pl-4 pr-3 text-sm font-medium sm:pl-3">
                                    <Badge
                                        color={item.is_active ? "success" : "danger"}
                                        content={<CheckMini viewBox="0 0 20 20" />}
                                        placement="bottom-right"
                                        size="md"
                                    >
                                        <Avatar className="h-full w-full" radius="md" src={item.image ?? null} />
                                    </Badge>
                                </td>
                                <td className="whitespace-nowrap px-3 py-4 text-sm">
                                    <div className="font-bold truncate max-w-32">{item?.name}</div>
                                </td>
                                <td className="whitespace-nowrap px-3 py-4 text-sm">
                                    <div className="font-bold truncate max-w-32">{item?.description}</div>
                                </td>
                                <td className="whitespace-nowrap px-3 py-4 text-sm">
                                    <p>{currency(Number(item?.price) ?? 0)}</p>
                                </td>
                                <td className="whitespace-nowrap px-3 py-4 text-sm">
                                    <p>{currency(Number(item?.old_price) ?? 0)}</p>
                                </td>
                                <td className="whitespace-nowrap px-3 py-4 text-sm">{new Date(item.created_at as string).toLocaleDateString()}</td>
                                <td className="relative whitespace-nowrap py-4 pl-3 pr-4 text-right text-sm font-medium">
                                    <Actions
                                        deleteAction={deleteProduct}
                                        form={
                                            <ProductForm
                                                brands={brands}
                                                categories={categories}
                                                collections={collections}
                                                current={item}
                                                type="update"
                                            />
                                        }
                                        item={item}
                                        label="product"
                                    />
                                </td>
                            </tr>
                        ))}
                    </Table>
                </div>
            </div>
        </React.Fragment>
    );
}
