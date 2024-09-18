import { Metadata } from "next";
import { Product } from "types/global";
import React from "react";
import { Table } from "@modules/common/components/table";
import ProductUpload from "@modules/admin/products/product-upload";
import { getProducts } from "@lib/data";
import { Badge } from "@nextui-org/badge";
import { Avatar } from "@nextui-org/avatar";
import { currency } from "@lib/util/util";
import { Actions } from "@modules/admin/components/actions";
import { deleteProduct, getCollections } from "@modules/admin/actions";
import { ProductForm } from "@modules/admin/products/product-form";

export const metadata: Metadata = {
    title: "Children clothing | TBO Store",
    description: "A performant frontend ecommerce starter template with Next.js.",
};

const fetchProducts = async (search = "", page = 1, limit = 10) => {
    const products = await getProducts(search, undefined, page, limit);
    return products;
};

export default async function ProductsPage({ searchParams }: { searchParams: { search?: string; page?: string; limit?: string } }) {
    const search = searchParams.search || "";
    const page = parseInt(searchParams.page || "1", 10);
    const limit = parseInt(searchParams.limit || "10", 10);
    const { products, ...pagination } = await fetchProducts(search, page, limit);
    const { collections } = await getCollections(1, 100);

    return (
        <React.Fragment>
            <div>
                <div className="max-w-7xl mx-auto p-8">
                    <h1 className="text-2xl font-semibold mb-2">Products</h1>
                    <div className="py-4">
                        <ProductUpload />
                    </div>
                    <Table
                        form={<ProductForm type="create" collections={collections} />}
                        columns={["No", "Image", "Name", "Description", "Price", "Old Price", "Created At"]}
                        pagination={pagination}
                        canExport
                        canIndex
                        searchQuery={search}
                    >
                        {products
                            ?.sort((a: any, b: any) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
                            .map((item: Product, index: number) => (
                                <tr key={item.id} className="even:bg-content2">
                                    <td className="whitespace-nowrap py-4 pl-4 pr-3 text-sm font-medium sm:pl-3">
                                        {(page - 1) * limit + index + 1}
                                    </td>
                                    <td className="whitespace-nowrap py-4 pl-4 pr-3 text-sm font-medium sm:pl-3">
                                        <Badge content="" color={item.is_active ? "success" : "danger"} shape="circle" placement="bottom-right">
                                            <Avatar radius="md" src={item.image} />
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
                                        <Actions item={item} form={<ProductForm type="update" collections={collections} current={item} />} deleteAction={deleteProduct} />
                                    </td>
                                </tr>
                            ))}
                    </Table>
                </div>
            </div>
        </React.Fragment>
    );
}
