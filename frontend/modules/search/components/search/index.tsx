"use client";

import React, { ChangeEvent, useState } from "react";
import { MagnifyingGlassMini } from "nui-react-icons";
import SearchInput from "@modules/search/components/search-input";
import { useOverlayTriggerState } from "@react-stately/overlays";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

import { Kbd } from "@/components/ui/kbd";
import { Button } from "@/components/ui/button";
import NoProductsFound from "@/components/store/products/no-products";
import { debounce } from "@/lib/utils";
import { ProductSearch } from "@/types/models";
import { api } from "@/apis";
import ProductCard from "@/components/store/products/product-card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";

interface Props {
    className?: string;
}

const Search: React.FC<Props> = ({ className }) => {
    const router = useRouter();
    const state = useOverlayTriggerState({});
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
                    <div className="max-h-[80vh] min-h-[70vh] overflow-y-auto">
                        {products.length == 0 && <NoProductsFound />}
                        <div className="grid w-full gap-2 md:gap-4 grid-cols-2 md:grid-cols-3">
                            {products.map((product: ProductSearch, index: number) => (
                                <ProductCard key={index} product={product} />
                            ))}
                        </div>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
};

export default Search;
