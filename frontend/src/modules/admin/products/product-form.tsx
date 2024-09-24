"use client";

import React, { forwardRef, useRef } from "react";
import { Input } from "@nextui-org/input";
import { FormButton } from "@modules/common/components/form-button";
import { useSnackbar } from "notistack";
import { ImageUpload } from "@modules/common/components/image-upload";
import Button from "@modules/common/components/button";
import { useFormState } from "react-dom";
import { Textarea } from "@nextui-org/input";
import { MultiSelect } from "@modules/common/components/multiselect";
import { Checkbox } from "@modules/common/components/checkbox";
import { useRouter } from "next/navigation";

import { createProduct, uploadProductImage } from "../actions";

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
        const [selectedCollections, setSelectedCollections] = React.useState<string[]>([]);
        const isCreate = type === "create";

        React.useEffect(() => {
            const selected_collections = collections.filter((item) => current?.collections?.includes(item.name)).map((item) => item?.id?.toString());

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
                                        {!isCreate && <ImageUpload defaultImage={current.image} onUpload={handleUpload} />}
                                    </div>
                                    <input readOnly className="hidden" name="type" type="text" value={type} />
                                    <input readOnly className="hidden" name="id" type="text" value={current.id} />
                                    <Input required defaultValue={current.name} label="Name" name="name" placeholder="Ex. Gown" />
                                    <Checkbox isSelected={current.is_active} label="Is Active" name="is_active" />
                                    <Textarea
                                        defaultValue={current.description}
                                        name="description"
                                        placeholder="Product description"
                                        variant="bordered"
                                    />
                                    <MultiSelect
                                        defaultValue={selectedTags}
                                        label="Tags"
                                        name="tags"
                                        options={tagOptions}
                                        placeholder="Select Tags"
                                        variant="bordered"
                                    />
                                    <MultiSelect
                                        defaultValue={selectedCollections}
                                        label="Collections"
                                        name="collections"
                                        options={collectionOptions}
                                        placeholder="Select Collections"
                                        variant="bordered"
                                    />
                                    <Input required defaultValue={current.price} label="Price" name="price" placeholder="Ex. 2500" type="number" />
                                    <Input
                                        required
                                        defaultValue={current.old_price}
                                        label="Old Price"
                                        name="old_price"
                                        placeholder="Ex. 2500"
                                        type="number"
                                    />
                                </div>
                            </div>
                        </div>
                        <div className="flex flex-shrink-0 justify-end py-4 px-8 space-x-2 absolute bottom-0 bg-default-50 w-full right-0 z-50">
                            <Button className="min-w-32" color="danger" variant="shadow" onClick={onClose}>
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
