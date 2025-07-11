"use client";

import React, { ChangeEvent, useState } from "react";
import { MagnifyingGlassMini } from "nui-react-icons";
import { useOverlayTriggerState } from "@react-stately/overlays";
import { useRouter } from "next/navigation";

import { Kbd } from "@/components/ui/kbd";
import { Button } from "@/components/ui/button";
import NoProductsFound from "@/components/store/products/no-products";
import { debounce } from "@/lib/utils";
import { ProductSearch } from "@/schemas/product";
import ProductCard from "@/components/store/products/product-card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import SearchInput from "@/components/store/search/search-input";
import { useProductSearch } from "@/lib/hooks/useProduct";
import ComponentLoader from "@/components/component-loader";

interface Props {
    className?: string;
}

const Search: React.FC<Props> = ({ className }) => {
    const router = useRouter();
    const state = useOverlayTriggerState({});
    const modalState = useOverlayTriggerState({});
    const [value, setValue] = useState("");
    const { data, error, isLoading } = useProductSearch({ search: value, limit: 15, page: 1 });

    const handleChange = (event: ChangeEvent<HTMLInputElement>) => {
        setValue(event?.target?.value);
    };

    const onSubmit = () => {
        if (value) {
            router.push(`/search/${value}`);
        }
    };

    const onReset = () => {
        setValue("");
    };

    if (error) {
        return null;
    }

    return (
        <Dialog open={state.isOpen} onOpenChange={state.setOpen}>
            <DialogTrigger asChild>
                <Button
                    className={className}
                    endContent={<Kbd keys={["command"]}>K</Kbd>}
                    startContent={<MagnifyingGlassMini />}
                    variant="outline"
                    onClick={modalState.open}
                >
                    {`I'm looking for...`}
                </Button>
            </DialogTrigger>
            <DialogContent size="lg">
                <DialogHeader className="sr-only">
                    <DialogTitle>Search</DialogTitle>
                </DialogHeader>
                <div>
                    <div className="flex items-center w-full px-4 border-b border-default-300">
                        <MagnifyingGlassMini />
                        <SearchInput onChange={debounce(handleChange, 500)} onReset={onReset} onSubmit={onSubmit} />
                        <button aria-label="close" onClick={modalState.close}>
                            <Kbd className="md:block border-none px-2 py-1 font-medium text-[0.5rem] cursor-pointer">ESC</Kbd>
                        </button>
                    </div>
                    {isLoading ? (
                        <ComponentLoader className="h-[70vh]" />
                    ) : (
                        <div className="h-[70vh] overflow-y-auto">
                            {data?.products.length == 0 && <NoProductsFound />}
                            <div className="grid w-full gap-2 md:gap-4 grid-cols-2 md:grid-cols-3">
                                {data?.products.map((product: ProductSearch, idx: number) => <ProductCard key={idx} product={product} />)}
                            </div>
                        </div>
                    )}
                </div>
            </DialogContent>
        </Dialog>
    );
};

export default Search;
