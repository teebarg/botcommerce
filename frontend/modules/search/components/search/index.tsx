"use client";

import React, { ChangeEvent, useState } from "react";
import { MagnifyingGlassMini } from "nui-react-icons";
import SearchInput from "@modules/search/components/search-input";
import { useOverlayTriggerState } from "react-stately";
import { Modal } from "@modules/common/components/modal";
import { Kbd } from "@modules/common/components/kbd";
import { useSnackbar } from "notistack";
import { useRouter } from "next/navigation";
import dynamic from "next/dynamic";

import { Button } from "@/components/ui/button";
import { Product, SearchParams } from "@/types/global";
import NoProductsFound from "@/modules/products/components/no-products";
import { debounce } from "@/lib/util/util";
const ProductCard = dynamic(() => import("@/modules/products/components/product-card"), { ssr: false });

interface Props {
    className?: string;
}

const Search: React.FC<Props> = ({ className }) => {
    const { enqueueSnackbar } = useSnackbar();
    const router = useRouter();
    const modalState = useOverlayTriggerState({});
    const [products, setProducts] = useState<Product[]>([]);
    const [value, setValue] = useState("");

    const handleChange = async (event: ChangeEvent<HTMLInputElement>) => {
        setValue(event?.target?.value);
        try {
            const queryParams: SearchParams = {
                query: event?.target?.value,
                limit: 15,
                page: 1,
                sort: "created_at:desc",
            };
            const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/product/search`, {
                method: "POST",
                headers: {
                    accept: "application/json",
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(queryParams),
            });

            if (!response.ok) {
                throw new Error(response.statusText);
            }

            const { products } = await response.json();

            setProducts(products);
        } catch (error) {
            enqueueSnackbar(`Error occurred fetching products - ${error}`, { variant: "error" });
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
                color="default"
                endContent={<Kbd keys={["command"]}>K</Kbd>}
                startContent={<MagnifyingGlassMini />}
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
                                {products.map((product: Product, index: number) => (
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
