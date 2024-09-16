"use client";

import React, { forwardRef, useRef } from "react";

import { Input } from "@nextui-org/input";
import { FormButton } from "@modules/common/components/form-button";
import { createProduct, updateProduct, uploadProductImage } from "../actions";
import { useSnackbar } from "notistack";
import { ImageUpload } from "@modules/common/components/image-upload";
import Button from "@modules/common/components/button";
import { useFormState } from "react-dom";
import { Textarea } from "@nextui-org/input";
import { MultiSelect } from "@modules/common/components/multiselect";
import { Checkbox } from "@modules/common/components/checkbox";
import { useRouter } from "next/navigation";

interface Props {
    current?: any;
    type?: "create" | "update";
    tags?: { id: number; name: string }[];
    collections?: { id: number; name: string }[];
    onClose?: () => void;
}

interface ChildRef {
    submit: () => void;
}

const ProductForm = forwardRef<ChildRef, Props>(
    ({ type = "create", onClose, current = { name: "", is_active: true }, tags = [], collections = [] }, ref) => {
        const router = useRouter();
        const selectedTags = current?.tags?.map((item: any) => item.id) ?? [];
        // const selectedCollections = current?.collections?.map((item: any) => item.id) ?? [];
        const [selectedCollections, setSelectedCollections] = React.useState<string[]>([]);
        const isCreate = type === "create";

        React.useEffect(() => {
            const selected_collections = collections.filter((item) => current.collections.includes(item.name)).map((item) => item.id.toString());
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
                }
            }
        }, [state.success, state.message, enqueueSnackbar]);

        const collectionOptions = React.useMemo(() => {
            return collections.map((item) => {
                return { value: item.id, label: item.name };
            });
        }, collections);

        const tagOptions = React.useMemo(() => {
            return tags.map((item) => {
                return { value: item.id, label: item.name };
            });
        }, tags);

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
                                        {!isCreate && <ImageUpload onUpload={handleUpload} defaultImage={current.image} />}
                                    </div>
                                    <input type="text" name="type" value={type} className="hidden" readOnly />
                                    <input type="text" name="id" value={current.id} className="hidden" readOnly />
                                    <Input name="name" label="Name" placeholder="Ex. Gown" required defaultValue={current.name} />
                                    <Checkbox name="is_active" label="Is Active" isSelected={current.is_active} />
                                    <Textarea
                                        name="description"
                                        placeholder="Product description"
                                        variant="bordered"
                                        defaultValue={current.description}
                                    />
                                    <MultiSelect
                                        name="tags"
                                        options={tagOptions}
                                        label="Tags"
                                        placeholder="Select Tags"
                                        variant="bordered"
                                        defaultValue={selectedTags}
                                    />
                                    <MultiSelect
                                        name="collections"
                                        options={collectionOptions}
                                        label="Collections"
                                        placeholder="Select Collections"
                                        variant="bordered"
                                        defaultValue={selectedCollections}
                                    />
                                    <Input name="price" type="number" label="Price" placeholder="Ex. 2500" required defaultValue={current.price} />
                                    <Input
                                        name="old_price"
                                        type="number"
                                        label="Old Price"
                                        placeholder="Ex. 2500"
                                        required
                                        defaultValue={current.old_price}
                                    />
                                </div>
                            </div>
                        </div>
                        <div className="flex flex-shrink-0 justify-end py-4 px-8 space-x-2 absolute bottom-0 bg-default-50 w-full right-0 z-50">
                            <Button color="danger" onClick={onClose} variant="shadow" className="min-w-32">
                                Cancel
                            </Button>
                            <FormButton color="primary" variant="shadow" className="min-w-32">
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
