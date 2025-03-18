"use client";

import React, { forwardRef, useActionState, useRef } from "react";
import { useSnackbar } from "notistack";
import { ImageUpload } from "@modules/common/components/image-upload";
import { useRouter } from "next/navigation";
import { Input } from "@components/ui/input";
import { Number } from "@components/ui/number";
import { Textarea } from "@components/ui/textarea";
import { toast } from "sonner";

import { Multiselect } from "@/components/ui/multiselect";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { mutateProduct } from "@/actions/product";
import { Brand, Category, Collection } from "@/lib/models";
import { api } from "@/apis";

interface Props {
    current?: any;
    type?: "create" | "update";
    brands?: Brand[];
    categories?: Category[];
    collections?: Collection[];
    onClose?: () => void;
}

interface ChildRef {
    submit: () => void;
}

const ProductForm = forwardRef<ChildRef, Props>(
    ({ type = "create", onClose, current = { name: "", is_active: true }, brands = [], categories = [], collections = [] }, ref) => {
        const router = useRouter();
        const [selectedBrands, setSelectedBrands] = React.useState<number[]>([]);
        const [selectedCategories, setSelectedCategories] = React.useState<number[]>([]);
        const [selectedCollections, setSelectedCollections] = React.useState<number[]>([]);
        const isCreate = type === "create";

        React.useEffect(() => {
            const selected_brands = brands.filter((item) => current?.brands?.includes(item.name)).map((item) => item.id);
            const selected_categories = categories.filter((item) => current?.categories?.includes(item.name)).map((item) => item.id);
            const selected_collections = collections.filter((item) => current?.collections?.includes(item.name)).map((item) => item.id);

            setSelectedBrands(selected_brands);
            setSelectedCategories(selected_categories);
            setSelectedCollections(selected_collections);
        }, [current.collections]);

        const { enqueueSnackbar } = useSnackbar();
        const [state, formAction, isPending] = useActionState(mutateProduct, {
            success: false,
            message: "",
            data: null,
        });

        const formRef = useRef<HTMLFormElement>(null);

        React.useEffect(() => {
            if (state.success) {
                enqueueSnackbar(state.message || "Product created successfully", { variant: "success" });
                // Leave the slider open and clear form
                if (formRef.current) {
                    formRef.current.reset();
                    router.refresh();
                    onClose?.();
                }
            }
        }, [state, enqueueSnackbar]);

        const handleUpload = async (formData: FormData) => {
            const res = await api.product.uploadImage({ id: current.id, formData });

            if (res.error) {
                toast.error(res.error);

                return;
            }
            toast.success(res.data?.message || "Image uploaded successfully");
        };

        return (
            <React.Fragment>
                <div className="mx-auto w-full">
                    <form ref={formRef} action={formAction} className="h-full flex flex-col">
                        <div className="flex min-h-0 flex-1 flex-col overflow-y-scroll py-6 pb-20">
                            <div className="relative flex-1">
                                <div className="space-y-8 ">
                                    {/* Image uploader */}
                                    <div className="bg-content1 p-2 rounded-md">
                                        <span className="block text-sm font-medium mb-1">Product Image</span>
                                        {!isCreate && <ImageUpload defaultImage={current.image} onUpload={handleUpload} />}
                                    </div>
                                    <input readOnly className="hidden" name="type" type="text" value={type} />
                                    <input readOnly className="hidden" name="id" type="text" value={current.id} />
                                    <Input required defaultValue={current.name} label="Name" name="name" placeholder="Ex. Gown" />
                                    <Switch defaultSelected={current.is_active} label="Is Active" name="is_active" />
                                    <Textarea defaultValue={current.description} name="description" placeholder="Product description custom" />
                                    <Multiselect
                                        defaultValue={selectedBrands}
                                        label="Brands"
                                        name="brands"
                                        options={brands}
                                        placeholder="Select Brands"
                                        variant="bordered"
                                    />
                                    <Multiselect
                                        defaultValue={selectedCollections}
                                        label="Collections"
                                        name="collections"
                                        options={collections}
                                        placeholder="Select Collections"
                                        variant="bordered"
                                    />
                                    <Multiselect
                                        defaultValue={selectedCategories}
                                        label="Categories"
                                        name="categories"
                                        options={categories}
                                        placeholder="Select Categories"
                                        variant="bordered"
                                    />
                                    <Number
                                        isRequired
                                        defaultValue={current.price}
                                        description="Product's price"
                                        formatOptions={{
                                            style: "currency",
                                            currency: "NGN",
                                        }}
                                        label="Price"
                                        name="price"
                                        placeholder="Ex. 2500"
                                    />
                                    <Number
                                        isRequired
                                        defaultValue={current.old_price}
                                        description="Product's old price"
                                        formatOptions={{
                                            style: "currency",
                                            currency: "NGN",
                                        }}
                                        label="Old Price"
                                        name="old_price"
                                        placeholder="Ex. 2500"
                                    />
                                </div>
                            </div>
                        </div>
                        <div className="flex flex-shrink-0 items-center justify-end py-4 px-8 space-x-2 absolute bottom-0 bg-default-100 w-full right-0 z-50">
                            <Button aria-label="cancel" className="min-w-32" variant="destructive" onClick={onClose}>
                                Cancel
                            </Button>
                            <Button aria-label="submit" className="min-w-32" isLoading={isPending} type="submit">
                                {isCreate ? "Submit" : "Update"}
                            </Button>
                        </div>
                    </form>
                </div>
            </React.Fragment>
        );
    }
);

ProductForm.displayName = "ProductForm";

export { ProductForm };
