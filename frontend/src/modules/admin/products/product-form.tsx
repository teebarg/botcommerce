"use client";

import React, { forwardRef, useRef } from "react";
import { FormButton } from "@modules/common/components/form-button";
import { useSnackbar } from "notistack";
import { ImageUpload } from "@modules/common/components/image-upload";
import Button from "@modules/common/components/button";
import { useFormState } from "react-dom";
import { useRouter } from "next/navigation";
import { Switch } from "@modules/common/components/switch";
import { Multiselect } from "@modules/common/components/multiselect";
import { Category, Collection } from "types/global";
import { Input } from "@components/ui/input";
import { Number } from "@components/ui/number";
import { TextArea } from "@components/ui/textarea";

import { createProduct, uploadProductImage } from "../actions";

interface Props {
    current?: any;
    type?: "create" | "update";
    categories?: Category[];
    collections?: Collection[];
    onClose?: () => void;
}

interface ChildRef {
    submit: () => void;
}

const ProductForm = forwardRef<ChildRef, Props>(
    ({ type = "create", onClose, current = { name: "", is_active: true }, categories = [], collections = [] }, ref) => {
        const router = useRouter();
        const [selectedCategories, setSelectedCategories] = React.useState<number[]>([]);
        const [selectedCollections, setSelectedCollections] = React.useState<number[]>([]);
        const isCreate = type === "create";

        React.useEffect(() => {
            const selected_categories = categories.filter((item) => current?.categories?.includes(item.name)).map((item) => item.id);
            const selected_collections = collections.filter((item) => current?.collections?.includes(item.name)).map((item) => item.id);

            setSelectedCategories(selected_categories);
            setSelectedCollections(selected_collections);
        }, [current.collections]);

        const { enqueueSnackbar } = useSnackbar();
        const [state, formAction] = useFormState(createProduct, {
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

        const handleUpload = async (data: any) => {
            try {
                const res = await uploadProductImage({ productId: current.id, formData: data });

                if (res.success) {
                    router.refresh();
                }
                enqueueSnackbar(res.message, { variant: res.success ? "success" : "error" });
            } catch (error) {
                enqueueSnackbar(`${error}`, { variant: "error" });
            }
        };

        return (
            <React.Fragment>
                <div className="mx-auto w-full pb-8">
                    <form ref={formRef} action={formAction} className="h-full flex flex-col">
                        <div className="flex min-h-0 flex-1 flex-col overflow-y-scroll py-6">
                            <div className="relative flex-1">
                                <div className="space-y-8 ">
                                    {/* Image uploader */}
                                    <div>
                                        <span className="block text-sm font-medium mb-1">Product Image</span>
                                        {!isCreate && <ImageUpload defaultImage={current.image} onUpload={handleUpload} />}
                                    </div>
                                    <input readOnly className="hidden" name="type" type="text" value={type} />
                                    <input readOnly className="hidden" name="id" type="text" value={current.id} />
                                    <Input isRequired defaultValue={current.name} label="Name" name="name" placeholder="Ex. Gown" />
                                    <Switch defaultSelected={current.is_active} label="Is Active" name="is_active" />
                                    <TextArea defaultValue={current.description} name="description" placeholder="Product description custom" />
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
                            <Button className="min-w-32" color="danger" variant="shadow" onPress={onClose}>
                                Cancel
                            </Button>
                            <FormButton className="min-w-32" color="primary" variant="shadow">
                                {isCreate ? "Submit" : "Update"}
                            </FormButton>
                        </div>
                    </form>
                </div>
            </React.Fragment>
        );
    }
);

ProductForm.displayName = "ProductForm";

export { ProductForm };
