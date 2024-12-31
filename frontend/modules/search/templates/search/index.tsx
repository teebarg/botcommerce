"use client";

import React, { useState } from "react";
import { MagnifyingGlassMini } from "nui-react-icons";
import { SEARCH_INDEX_NAME, searchClient } from "@lib/search-client";
import Hit from "@modules/search/components/hit";
import Hits from "@modules/search/components/hits";
import { InstantSearch } from "react-instantsearch-hooks-web";
import SearchInput from "@modules/search/components/search-input";
import { useOverlayTriggerState } from "react-stately";
import { Modal } from "@modules/common/components/modal";
import { Kbd } from "@modules/common/components/kbd";

import { Button } from "@/components/ui/button";
import { Product, SearchParams } from "@/types/global";
import { ProductCard } from "@/modules/products/components/product-card";

interface Props {
    className?: string;
}

const Search: React.FC<Props> = ({ className }) => {
    const modalState = useOverlayTriggerState({});
    const [products, setProducts] = useState<Product[]>([]);

    const handleChange = async () => {
        try {
            const queryParams: SearchParams = {
                query: "",
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
                throw new Error("Failed to fetch search");
            }

            const { products } = await response.json();
            setProducts(products);
        } catch (error) {
            console.log(error);
        }
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
                <Modal hasX={false} size="lg" onClose={modalState.close}>
                    <div>
                        <div className="flex items-center w-full px-4 border-b border-default-500/50 dark:border-default-100">
                            <MagnifyingGlassMini />
                            <SearchInput onChange={handleChange} />
                            <button onClick={modalState.close}>
                                <Kbd className="md:block border-none px-2 py-1 font-medium text-[0.5rem] cursor-pointer">ESC</Kbd>
                            </button>
                        </div>
                        <div className="max-h-[70vh] min-h-[70vh] overflow-y-auto">
                            <div className="grid w-full gap-2 md:gap-4 grid-cols-2 md:grid-cols-3 pb-4">
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
