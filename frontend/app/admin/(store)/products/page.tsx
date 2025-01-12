import { Metadata } from "next";
import { Product } from "types/global";
import React from "react";
import { Table } from "@modules/common/components/table";
import ProductUpload from "@modules/admin/products/product-upload";
import { getBrands, getCategories, getCustomer, getProducts } from "@lib/data";
import { currency } from "@lib/util/util";
import { Actions } from "@modules/admin/components/actions";
import { deleteProduct, getCollections } from "@modules/admin/actions";
import { ProductForm } from "@modules/admin/products/product-form";
import { Badge } from "@modules/common/components/badge";
import { CheckMini } from "nui-react-icons";
import { Avatar } from "@modules/common/components/avatar";

export const metadata: Metadata = {
    title: "Children clothing | Botcommerce Store",
    description: "A performant frontend ecommerce starter template with Next.js.",
};

export default async function ProductsPage({ searchParams }: { searchParams: { search?: string; page?: string; limit?: string } }) {
    const search = searchParams.search || "";
    const page = parseInt(searchParams.page || "1", 10);
    const limit = parseInt(searchParams.limit || "10", 10);
    const { products, ...pagination } = await getProducts(search, undefined, page, limit);
    const { brands } = (await getBrands()) as { brands: [] };
    const { collections } = (await getCollections(1, 100)) as { collections: [] };
    const { categories } = await getCategories();

    const customer = await getCustomer().catch(() => null);

    return (
        <React.Fragment>
            <div>
                <div className="max-w-7xl mx-auto p-8">
                    <h1 className="text-2xl font-semibold mb-2">Products</h1>
                    <div className="py-4">
                        <ProductUpload customer={customer} />
                    </div>
                    <Table
                        canExport
                        canIndex
                        columns={["No", "Image", "Name", "Description", "Price", "Old Price", "Created At"]}
                        form={<ProductForm brands={brands} categories={categories} collections={collections} type="create" />}
                        pagination={pagination}
                        searchQuery={search}
                    >
                        {products
                            ?.sort((a: any, b: any) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
                            .map((item: Product, index: number) => (
                                <tr key={item.id} className="even:bg-content2">
                                    <td className="whitespace-nowrap py-4 pl-4 pr-3 text-sm font-medium sm:pl-3">{(page - 1) * limit + index + 1}</td>
                                    <td className="whitespace-nowrap py-4 pl-4 pr-3 text-sm font-medium sm:pl-3">
                                        <Badge
                                            color={item.is_active ? "success" : "danger"}
                                            content={<CheckMini viewBox="0 0 20 20" />}
                                            placement="bottom-right"
                                            size="md"
                                        >
                                            <Avatar className="h-full w-full" radius="md" src={item.image} />
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
                                    <td className="whitespace-nowrap px-3 py-4 text-sm">
                                        {new Date(item.created_at as string).toLocaleDateString()}
                                    </td>
                                    <td className="relative whitespace-nowrap py-4 pl-3 pr-4 text-right text-sm font-medium">
                                        <Actions
                                            label="product"
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
