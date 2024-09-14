"use client";

import React, { forwardRef, useRef } from "react";

import { Input, Select, SelectItem, Switch } from "@nextui-org/react";
import { FormButton } from "@modules/common/components/form-button";
import { createProduct, uploadProductImage } from "../actions";
import { useSnackbar } from "notistack";
import { ImageUpload } from "@modules/common/components/image-upload";
import Button from "@modules/common/components/button";
import { useFormState } from "react-dom";
import { Textarea } from "@nextui-org/input";
import { ComboBox } from "@modules/common/components/combobox";

type Inputs = {
    name: string;
    is_active: boolean;
    tags: Set<number | string>;
    collections: Set<number | string>;
    price: number;
    old_price: number;
    description: string;
};

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

const items = [
    { id: 1, name: "Apple" },
    { id: 2, name: "Banana" },
    { id: 3, name: "Cherry" },
    { id: 4, name: "Date" },
    { id: 5, name: "Elderberry" },
];

const ProductForm = forwardRef<ChildRef, Props>(
    ({ type = "create", onClose, current = { name: "", is_active: true }, tags = [], collections = [] }, ref) => {
        const selectedTags = current?.tags?.map((item: any) => item.id) ?? [];
        const selectedCollections = current?.collections?.map((item: any) => item.id) ?? [];

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
                }
            }
        }, [state.success, state.message, enqueueSnackbar]);

        const isCreate = type === "create";

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
                await uploadProductImage({ productId: current.id, formData: data });
                enqueueSnackbar("Image uploaded successfully", { variant: "success" });
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
                                    <Input name="name" label="Name" placeholder="Ex. Gown" required />
                                    <Switch name="is_active" />
                                    <Textarea name="description" placeholder="Product description" variant="bordered" />
                                    <Select
                                        label="Tags"
                                        variant="bordered"
                                        placeholder="Select Tags"
                                        // selectedKeys={selectedTags}
                                        className=""
                                    >
                                        {tagOptions.map((tag) => (
                                            <SelectItem key={tag.value}>{tag.label}</SelectItem>
                                        ))}
                                    </Select>
                                    <Select
                                        label="Collections"
                                        variant="bordered"
                                        placeholder="Select Collections"
                                        // selectedKeys={selectedCollections}
                                        className=""
                                    >
                                        {collectionOptions.map((collection) => (
                                            <SelectItem key={collection.value}>{collection.label}</SelectItem>
                                        ))}
                                    </Select>
                                    <ComboBox name="beaf" label="Select a fruit" items={items} description="Select a fruit" placeholder="Select a fruit" />
                                    <Input name="price" type="number" label="Price" placeholder="Ex. 2500" required />
                                    <Input name="old_price" type="number" label="Old Price" placeholder="Ex. 2500" required />
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
