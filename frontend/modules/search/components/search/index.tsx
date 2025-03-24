"use client";

import React, { ChangeEvent, useState } from "react";
import { MagnifyingGlassMini } from "nui-react-icons";
import SearchInput from "@modules/search/components/search-input";
import { useOverlayTriggerState } from "react-stately";
import { Modal } from "@modules/common/components/modal";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

import { Kbd } from "@/components/ui/kbd";
import { Button } from "@/components/ui/button";
import NoProductsFound from "@/modules/products/components/no-products";
import { debounce } from "@/lib/util/util";
import { ProductSearch } from "@/lib/models";
import { api } from "@/apis";
import ProductCard from "@/components/store/products/product-card";

interface Props {
    className?: string;
}

const Search: React.FC<Props> = ({ className }) => {
    const router = useRouter();
    const modalState = useOverlayTriggerState({});
    const [products, setProducts] = useState<ProductSearch[]>([]);
    const [value, setValue] = useState("");

    const handleChange = async (event: ChangeEvent<HTMLInputElement>) => {
        setValue(event?.target?.value);
        try {
            const queryParams: any = {
                query: event?.target?.value,
                limit: 15,
                page: 1,
            };
            const { data, error } = await api.product.search({ ...queryParams });
            // const url = buildUrl(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/product/`, { ...queryParams });
            // const response = await fetch(url, {
            //     method: "GET",
            //     headers: {
            //         accept: "application/json",
            //     },
            // });

            // if (!response.ok) {
            //     throw new Error(response.statusText);
            // }

            // const { products } = await response.json();
            if (error) {
                toast.error(error);

                return;
            }

            setProducts(data?.products ?? []);
        } catch (error) {
            toast.error(`Error occurred fetching products - ${error}`);
        }
    };

    const onSubmit = () => {
        if (value) {
            router.push(`/search/${value}`);
        }
    };

    const onReset = () => {
        setValue("");
    };

    return (
        <React.Fragment>
            <Button
                className={className}
                endContent={<Kbd keys={["command"]}>K</Kbd>}
                startContent={<MagnifyingGlassMini />}
                variant="outline"
                onClick={modalState.open}
            >
                {`I'm looking for...`}
            </Button>
            {modalState.isOpen && (
                <Modal hasX={false} isOpen={modalState.isOpen} size="lg" onClose={modalState.close}>
                    <div>
                        <div className="flex items-center w-full px-4 border-b border-default-500/50 dark:border-default-100">
                            <MagnifyingGlassMini />
                            <SearchInput onChange={debounce(handleChange, 500)} onReset={onReset} onSubmit={onSubmit} />
                            <button aria-label="close" onClick={modalState.close}>
                                <Kbd className="md:block border-none px-2 py-1 font-medium text-[0.5rem] cursor-pointer">ESC</Kbd>
                            </button>
                        </div>
                        <div className="max-h-[70vh] min-h-[70vh] overflow-y-auto mt-2">
                            {products.length == 0 && <NoProductsFound />}
                            <div className="grid w-full gap-2 md:gap-4 grid-cols-2 md:grid-cols-3">
                                {products.map((product: ProductSearch, index: number) => (
                                    <ProductCard key={index} product={product} />
                                ))}
                            </div>
                        </div>
                    </div>
                </Modal>
            )}
        </React.Fragment>
    );
};

export default Search;
