import { useState } from "react";
import {
    FileText,
    Package,
    Plus,
    Tag,
    Trash2,
    Info,
    X,
} from "lucide-react";

import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import MultiSelect, { type SelectOption } from "@/components/ui/multi-select";
import { useCollections } from "@/hooks/useCollection";
import { useCategories } from "@/hooks/useCategories";
import type { Product, ProductOption } from "@/schemas";
import { Button } from "@/components/ui/button";
import {
    useCreateImageMetadata,
    useUpdateImageMetadata,
} from "@/hooks/useGallery";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { variantAttributes } from "@/lib/variant";
import { cn } from "@/utils/cn";

type EditableVariant = {
    // uid is UI-only: a stable React key that never goes to the API.
    uid: string;
    id?: number;
    sku?: string;
    attributes: Record<string, string>;
    price: number;
    old_price: number;
    inventory: number;
};

type FormProduct = Omit<
    Partial<Product>,
    "images" | "variants" | "categories" | "collections"
> & {
    categories: SelectOption[];
    collections: SelectOption[];
};

interface ProductSheetFormProps {
    imageId: number;
    onClose: () => void;
    currentProduct?: Product;
}

const MAX_VARIANTS = 500;

const COMMON_ATTRIBUTES = [
    "Size",
    "Color",
    "Age",
    "Length",
    "Waist",
    "Width",
];

let uidCounter = 0;
const makeUid = () => `v${++uidCounter}`;

function toRecord(raw: unknown): Record<string, string> {
    let value = raw;

    if (typeof value === "string") {
        try {
            value = JSON.parse(value);
        } catch {
            return {};
        }
    }

    const result: Record<string, string> = {};

    if (Array.isArray(value)) {
        for (const item of value as any[]) {
            const name = item?.name ?? item?.key ?? item?.attribute;
            const val = item?.value;
            if (name != null && val != null) result[String(name)] = String(val);
        }
    } else if (value && typeof value === "object") {
        for (const [k, v] of Object.entries(value as Record<string, unknown>)) {
            if (v != null) result[k] = String(v);
        }
    }

    return result;
}

function getVariantAttributes(
    variant: any,
    options: ProductOption[] = [],
): Record<string, string> {
    let result = toRecord(variant?.attributes);

    if (!Object.keys(result).length) {
        result = toRecord(variantAttributes(variant));
    }

    // Use the option's own spelling for keys so "size" and "Size" line up.
    const names = new Map(
        options.map((o) => [o.name.trim().toLowerCase(), o.name.trim()]),
    );

    const cleaned: Record<string, string> = {};
    for (const [key, value] of Object.entries(result)) {
        const v = String(value).trim();
        if (!v) continue;
        cleaned[names.get(key.trim().toLowerCase()) ?? key.trim()] = v;
    }
    return cleaned;
}

function combinationKey(attributes: Record<string, string>) {
    return Object.entries(attributes)
        .sort(([a], [b]) => a.localeCompare(b))
        .map(
            ([key, value]) =>
                `${key.trim().toLowerCase()}:${String(value).trim().toLowerCase()}`,
        )
        .join("|");
}

function normalize(attributes: Record<string, string>) {
    const out: Record<string, string> = {};
    for (const [k, v] of Object.entries(attributes)) {
        out[k.trim().toLowerCase()] = String(v).trim().toLowerCase();
    }
    return out;
}

// every key/value of `a` also exists in `b`
function isSubset(a: Record<string, string>, b: Record<string, string>) {
    return Object.entries(a).every(([k, v]) => b[k] === v);
}

// Trims names/values, removes duplicate choices (case-insensitive), drops
// duplicate option names and options that have no choices at all.
// Data coming from the API is not always clean, and a single bad option would
// otherwise disable "Generate combinations" with no visible cause.
function sanitizeOptions(options: ProductOption[]): ProductOption[] {
    const seenNames = new Set<string>();
    const result: ProductOption[] = [];

    for (const option of options) {
        const name = String(option.name ?? "").trim();
        const lowerName = name.toLowerCase();
        if (!name || seenNames.has(lowerName)) continue;
        seenNames.add(lowerName);

        const seenValues = new Set<string>();
        const values: string[] = [];
        for (const raw of option.values ?? []) {
            const value = String(raw ?? "").trim();
            const lowerValue = value.toLowerCase();
            if (!value || seenValues.has(lowerValue)) continue;
            seenValues.add(lowerValue);
            values.push(value);
        }

        if (values.length) result.push({ ...option, name, values });
    }

    return result;
}

// A variant is "removed" when its attributes no longer fit the product options
// (e.g. the choice "Red" was deleted). Removed variants stay in the database for
// order history, but the form and the store must ignore them.
function fitsOptions(
    attributes: Record<string, string>,
    options: ProductOption[],
) {
    const normalized = normalize(attributes);
    if (!options.length) return Object.keys(normalized).length === 0;

    const allowed = new Map(
        options.map((option) => [
            option.name.trim().toLowerCase(),
            new Set(option.values.map((value) => value.trim().toLowerCase())),
        ]),
    );

    const names = Object.keys(normalized);
    return (
        names.length === allowed.size &&
        names.every((name) => allowed.get(name)?.has(normalized[name]))
    );
}

// Builds the starting options and variants for the form.
// The saved product options are the source of truth. Options are only rebuilt
// from variant attributes for older products that never saved any options.
function buildInitialState(product?: Product): {
    options: ProductOption[];
    variants: EditableVariant[];
} {
    const savedOptions = ((product?.options ?? []) as any[])
        .map((option) => ({
            ...option,
            name: String(option?.name ?? "").trim(),
            values: ((option?.values ?? []) as any[])
                .map((value) =>
                    String(
                        value !== null && typeof value === "object"
                            ? (value.value ?? value.name ?? "")
                            : (value ?? ""),
                    ).trim(),
                )
                .filter(Boolean),
        }))
        .filter((option) => option.name) as ProductOption[];

    const saved: EditableVariant[] = (
        (product?.variants ?? []) as any[]
    ).map((variant) => ({
        uid: makeUid(),
        id: variant.id,
        sku: variant.sku ?? undefined,
        attributes: getVariantAttributes(variant, savedOptions),
        price: Number(variant.price) || 0,
        old_price: Number(variant.old_price) || 0,
        inventory: Number(variant.inventory) || 0,
    }));

    const options: ProductOption[] = savedOptions.map((option) => ({
        ...option,
        values: [...option.values],
    }));

    if (!options.length) {
        for (const variant of saved) {
            for (const [name, value] of Object.entries(variant.attributes)) {
                let option = options.find(
                    (item) => item.name.toLowerCase() === name.toLowerCase(),
                );

                if (!option) {
                    option = { name, values: [] } as ProductOption;
                    options.push(option);
                }

                if (
                    !option.values.some(
                        (item) => item.toLowerCase() === value.toLowerCase(),
                    )
                ) {
                    option.values.push(value);
                }
            }
        }
    }

    const cleanOptions = sanitizeOptions(options);
    const live = saved.filter((variant) =>
        fitsOptions(variant.attributes, cleanOptions),
    );
    const reconciled = reconcileVariants(cleanOptions, live);

    return {
        options: cleanOptions,
        variants: reconciled.ok ? reconciled.variants : live,
    };
}

function buildCombinations(
    options: ProductOption[],
): Record<string, string>[] {
    if (!options.length) return [];

    return options.reduce<Record<string, string>[]>(
        (combinations, option) => {
            if (
                !option.name.trim() ||
                !option.values.length ||
                option.values.some((value) => !value.trim())
            ) {
                return [];
            }

            return combinations.flatMap((combination) =>
                option.values.map((value) => ({
                    ...combination,
                    [option.name.trim()]: value.trim(),
                })),
            );
        },
        [{}],
    );
}

type ReconcileResult =
    | {
        ok: true;
        variants: EditableVariant[];
        added: number;
        removed: number;
        removedStock: number;
    }
    | { ok: false; error: string };

// The combinations list is always exactly what the options produce.
// Matching combinations keep their id, price and stock. Pure function: no state.
function reconcileVariants(
    options: ProductOption[],
    previous: EditableVariant[],
): ReconcileResult {
    if (options.length === 0) {
        const base =
            previous.find((item) => !Object.keys(item.attributes).length) ??
            previous[0];

        return {
            ok: true,
            added: base ? 0 : 1,
            removed: Math.max(0, previous.length - 1),
            removedStock: previous
                .filter((item) => item !== base)
                .reduce((sum, item) => sum + item.inventory, 0),
            variants: [
                {
                    uid: base?.uid ?? makeUid(),
                    id: base?.id,
                    sku: base?.sku,
                    attributes: {},
                    price: base?.price ?? 0,
                    old_price: base?.old_price ?? 0,
                    inventory: base?.inventory ?? 0,
                },
            ],
        };
    }

    const total = options.reduce(
        (count, option) => count * option.values.length,
        1,
    );
    if (total > MAX_VARIANTS) {
        return {
            ok: false,
            error: `That would create ${total} combinations. The most allowed is ${MAX_VARIANTS}. Remove some choices first.`,
        };
    }

    const combinations = buildCombinations(options);
    if (!combinations.length) {
        return {
            ok: false,
            error: "Each option needs a name and at least one choice.",
        };
    }

    const existing = previous.map((variant) => ({
        variant,
        key: combinationKey(variant.attributes),
        norm: normalize(variant.attributes),
    }));
    const claimed = new Set<number>();
    let added = 0;

    // Pass 1: exact matches keep id, price and stock.
    const exact: (EditableVariant | null)[] = combinations.map((attributes) => {
        const key = combinationKey(attributes);
        const idx = existing.findIndex(
            (item, i) => !claimed.has(i) && item.key === key,
        );
        if (idx === -1) return null;
        claimed.add(idx);
        return { ...existing[idx].variant, attributes };
    });

    // Pass 2: everything else. Covers adding an option to an existing
    // product (the old row moves to the first new combination) and new choices.
    const variants: EditableVariant[] = combinations.map((attributes, i) => {
        const match = exact[i];
        if (match) return match;

        const norm = normalize(attributes);
        const related = (item: (typeof existing)[number]) =>
            isSubset(item.norm, norm) || isSubset(norm, item.norm);

        const freeIdx = existing.findIndex(
            (item, idx) => !claimed.has(idx) && related(item),
        );
        if (freeIdx !== -1) {
            claimed.add(freeIdx);
            return { ...existing[freeIdx].variant, attributes };
        }

        const template = existing.find(related)?.variant;
        added += 1;
        return {
            uid: makeUid(),
            attributes,
            price: template?.price ?? 0,
            old_price: template?.old_price ?? 0,
            inventory: 0,
        };
    });

    const dropped = existing.filter((_, idx) => !claimed.has(idx));

    return {
        ok: true,
        variants,
        added,
        removed: dropped.length,
        removedStock: dropped.reduce(
            (sum, item) => sum + item.variant.inventory,
            0,
        ),
    };
}

const describeVariant = (attributes: Record<string, string>, separator: string) =>
    Object.entries(attributes)
        .map(([name, value]) => `${name}: ${value}`)
        .join(separator) || "Default product";

export function ImageSheetForm({
    onClose,
    imageId,
    currentProduct,
}: ProductSheetFormProps) {
    const {
        mutateAsync: createImageMetadata,
        isPending: createPending,
    } = useCreateImageMetadata();

    const {
        mutateAsync: updateImageMetadata,
        isPending: updatePending,
    } = useUpdateImageMetadata();

    const isPending = createPending || updatePending;

    const { data: collections } = useCollections();
    const { data: categories } = useCategories();

    const [product, setProduct] = useState<FormProduct>({
        name: currentProduct?.name ?? "",
        description: currentProduct?.description ?? "",
        categories:
            currentProduct?.categories?.map((item) => ({
                value: item.id,
                label: item.name,
            })) ?? [],
        collections:
            currentProduct?.collections?.map((item) => ({
                value: item.id,
                label: item.name,
            })) ?? [],
        active: currentProduct?.active ?? true,
        is_new: currentProduct?.is_new ?? false,
    });

    const [initial] = useState(() => buildInitialState(currentProduct));

    const [options, setOptions] = useState<ProductOption[]>(initial.options);
    const [variants, setVariants] = useState<EditableVariant[]>(
        initial.variants,
    );

    const [selectedAttribute, setSelectedAttribute] = useState("");
    const [customAttributeName, setCustomAttributeName] = useState("");
    const [valueInput, setValueInput] = useState("");
    const [draftValues, setDraftValues] = useState<string[]>([]);
    const [valueInputs, setValueInputs] = useState<Record<number, string>>({});

    // "Set for all" shortcuts in step 2. They only fill the rows on screen.
    const [allPrice, setAllPrice] = useState("");
    const [allQuantity, setAllQuantity] = useState("");

    // Shown in step 2 after every change to the options.
    const [changeMessage, setChangeMessage] = useState("");
    // Shown in step 1 next to the option builder, where the admin is working.
    const [optionMessage, setOptionMessage] = useState("");

    const isCustomAttribute = selectedAttribute === "custom";

    const attributeName = isCustomAttribute
        ? customAttributeName.trim()
        : selectedAttribute.trim();

    const invalidOptions =
        options.length > 0 &&
        (
            options.some(
                (option) =>
                    !option.name.trim() ||
                    !option.values.length ||
                    option.values.some((value) => !value.trim()) ||
                    new Set(
                        option.values.map((value) =>
                            value.trim().toLowerCase(),
                        ),
                    ).size !== option.values.length,
            ) ||
            new Set(
                options.map((option) =>
                    option.name.trim().toLowerCase(),
                ),
            ).size !== options.length
        );

    // A combination with quantity 0 is just "out of stock", so it doesn't need
    // its own price. It borrows the price of another combination on save.
    const isVariantInvalid = (variant: EditableVariant) =>
        (variant.inventory > 0 &&
            (!Number.isFinite(variant.price) || variant.price < 2)) ||
        !Number.isFinite(variant.inventory) ||
        variant.inventory < 0 ||
        !Number.isInteger(variant.inventory);

    const invalidVariantCount = variants.filter(isVariantInvalid).length;

    const fallbackPrice = variants.find((variant) => variant.price >= 2)?.price;

    const isDisabled =
        !product.name?.trim() ||
        invalidOptions ||
        variants.length === 0 ||
        invalidVariantCount > 0 ||
        fallbackPrice === undefined;

    // Tell the admin exactly why Save is disabled.
    const saveBlockers: string[] = [];
    if (!product.name?.trim()) saveBlockers.push("Enter a product name.");
    if (invalidOptions)
        saveBlockers.push(
            "Each option needs a name and unique, non-empty choices.",
        );
    if (invalidVariantCount > 0)
        saveBlockers.push(
            `${invalidVariantCount} item(s) with stock need a price of ₦2 or more.`,
        );
    if (invalidVariantCount === 0 && fallbackPrice === undefined)
        saveBlockers.push("Enter a price for at least one combination.");

    const updateProductField = (
        field: keyof FormProduct,
        value: string | boolean | SelectOption[],
    ) => {
        setProduct(
            (previous) => ({ ...previous, [field]: value }) as FormProduct,
        );
    };

    const describeChange = (result: {
        added: number;
        removed: number;
        removedStock: number;
    }) => {
        const parts: string[] = [];
        if (result.added > 0) {
            parts.push(
                `${result.added} new combination${result.added === 1 ? "" : "s"} added. Enter ${result.added === 1 ? "its" : "their"} price and quantity below.`,
            );
        }
        if (result.removed > 0) {
            parts.push(
                `${result.removed} combination${result.removed === 1 ? "" : "s"} removed` +
                (result.removedStock > 0
                    ? `. ${result.removedStock} item${result.removedStock === 1 ? "" : "s"} in stock will no longer be sold.`
                    : "."),
            );
        }
        return parts.join(" ");
    };

    // Every change to the options updates the combinations list straight away.
    // Returns false (and changes nothing) when the change is not allowed.
    const updateOptions = (nextOptions: ProductOption[]): boolean => {
        const result = reconcileVariants(nextOptions, variants);

        if ("error" in result) {
            setOptionMessage(result.error);
            return false;
        }

        setOptions(nextOptions);
        setVariants(result.variants);
        setOptionMessage("");
        setChangeMessage(describeChange(result));
        return true;
    };

    const addDraftValue = () => {
        const value = valueInput.trim();

        if (!value) return;

        if (
            draftValues.some(
                (item) => item.toLowerCase() === value.toLowerCase(),
            )
        ) {
            setOptionMessage("That choice has already been added.");
            return;
        }

        setOptionMessage("");
        setDraftValues((previous) => [...previous, value]);
        setValueInput("");
    };

    const removeDraftValue = (value: string) => {
        setDraftValues((previous) =>
            previous.filter((item) => item !== value),
        );
    };

    const resetAttributeBuilder = () => {
        setSelectedAttribute("");
        setCustomAttributeName("");
        setDraftValues([]);
        setValueInput("");
    };

    const addOption = () => {
        const name = attributeName;

        // Include a choice that was typed but not yet added with "Add",
        // otherwise the admin loses it silently.
        const pending = valueInput.trim();
        const values =
            pending &&
                !draftValues.some(
                    (item) => item.toLowerCase() === pending.toLowerCase(),
                )
                ? [...draftValues, pending]
                : draftValues;

        if (!name || !values.length) return;

        if (
            options.some(
                (option) =>
                    option.name.trim().toLowerCase() === name.toLowerCase(),
            )
        ) {
            setOptionMessage(
                "This option already exists. Choose a different name.",
            );
            return;
        }

        if (updateOptions([...options, { name, values: [...values] }])) {
            resetAttributeBuilder();
        }
    };

    const removeOption = (index: number) => {
        if (
            updateOptions(
                options.filter((_, optionIndex) => optionIndex !== index),
            )
        ) {
            // valueInputs is keyed by index, so it must be cleared when indexes shift.
            setValueInputs({});
        }
    };

    const addOptionValue = (index: number) => {
        const value = (valueInputs[index] ?? "").trim();

        if (!value) return;

        const option = options[index];

        if (
            option.values.some(
                (item) => item.toLowerCase() === value.toLowerCase(),
            )
        ) {
            setOptionMessage("That choice has already been added.");
            return;
        }

        const changed = updateOptions(
            options.map((item, optionIndex) =>
                optionIndex === index
                    ? {
                        ...item,
                        values: [...item.values, value],
                    }
                    : item,
            ),
        );

        if (changed) {
            setValueInputs((previous) => ({
                ...previous,
                [index]: "",
            }));
        }
    };

    const removeOptionValue = (
        optionIndex: number,
        value: string,
    ) => {
        const remaining = options[optionIndex].values.filter(
            (item) => item !== value,
        );

        // An option with no choices left is removed completely.
        if (remaining.length === 0) {
            removeOption(optionIndex);
            return;
        }

        updateOptions(
            options.map((option, index) =>
                index === optionIndex
                    ? { ...option, values: remaining }
                    : option,
            ),
        );
    };

    const updateVariant = (
        uid: string,
        patch: Partial<EditableVariant>,
    ) => {
        setVariants((previous) =>
            previous.map((variant) =>
                variant.uid === uid ? { ...variant, ...patch } : variant,
            ),
        );
    };

    const applyPriceToAll = () => {
        const price = Number(allPrice);
        if (!Number.isFinite(price) || price < 2) return;
        setVariants((previous) =>
            previous.map((variant) => ({ ...variant, price })),
        );
        setAllPrice("");
    };

    const applyQuantityToAll = () => {
        const quantity = Number.parseInt(allQuantity, 10);
        if (!Number.isFinite(quantity) || quantity < 0) return;
        setVariants((previous) =>
            previous.map((variant) => ({ ...variant, inventory: quantity })),
        );
        setAllQuantity("");
    };

    const handleSubmit = async () => {
        if (isDisabled || isPending) return;

        const input = {
            name: product.name?.trim(),
            description: product.description,
            category_ids: product.categories.map((item) =>
                Number(item.value),
            ),
            collection_ids: product.collections.map((item) =>
                Number(item.value),
            ),
            active: product.active,
            is_new: product.is_new,
            options: options.map((option) => ({
                ...option,
                name: option.name.trim(),
                values: option.values.map((value) => value.trim()),
            })),
            variants: variants.map((variant) => ({
                id: variant.id,
                price: variant.price >= 2 ? variant.price : fallbackPrice,
                old_price: variant.old_price || 0,
                inventory: variant.inventory,
                attributes: variant.attributes,
            })),
        };

        try {
            if (currentProduct?.id) {
                await updateImageMetadata({ imageId, input });
            } else {
                await createImageMetadata({ imageId, input });
            }
            onClose();
        } catch {
            // The mutation hooks surface the error; keep the form open so
            // the admin doesn't lose their work.
        }
    };

    return (
        <div className="flex min-h-0 flex-1 flex-col overflow-hidden">
            <div className="flex-1 space-y-5 overflow-y-auto overscroll-contain px-3 py-4 sm:px-4">

                {/* PRODUCT DETAILS */}
                <section className="space-y-3">
                    <div>
                        <h2 className="text-lg font-semibold">
                            Product Details
                        </h2>
                        <p className="text-sm text-muted-foreground">
                            Tell us about the product you are adding.
                        </p>
                    </div>

                    <Card className="space-y-4 p-3 sm:p-4">
                        <div className="space-y-2">
                            <Label htmlFor="product-name">
                                <Package className="mr-2 inline h-4 w-4 text-primary" />
                                Product Name
                            </Label>
                            <Input
                                id="product-name"
                                placeholder="e.g. GlowSkin Body Cream"
                                value={product.name ?? ""}
                                onChange={(event) =>
                                    updateProductField(
                                        "name",
                                        event.target.value,
                                    )
                                }
                            />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="product-description">
                                <FileText className="mr-2 inline h-4 w-4 text-primary" />
                                Description
                            </Label>
                            <Textarea
                                id="product-description"
                                className="min-h-[90px] resize-none"
                                placeholder="Describe your product..."
                                value={product.description ?? ""}
                                onChange={(event) =>
                                    updateProductField(
                                        "description",
                                        event.target.value,
                                    )
                                }
                            />
                        </div>

                        <div className="grid gap-4 sm:grid-cols-2">
                            <div className="space-y-2">
                                <Label>
                                    <Tag className="mr-2 inline h-4 w-4 text-primary" />
                                    Categories
                                </Label>
                                <MultiSelect
                                    name="categories"
                                    options={
                                        categories?.map((item) => ({
                                            value: item.id,
                                            label: item.name,
                                        })) ?? []
                                    }
                                    value={product.categories}
                                    onChange={(value) =>
                                        updateProductField("categories", value)
                                    }
                                />
                            </div>

                            <div className="space-y-2">
                                <Label>
                                    <Tag className="mr-2 inline h-4 w-4 text-primary" />
                                    Collections
                                </Label>
                                <MultiSelect
                                    name="collections"
                                    options={
                                        collections?.map((item) => ({
                                            value: item.id,
                                            label: item.name,
                                        })) ?? []
                                    }
                                    value={product.collections}
                                    onChange={(value) =>
                                        updateProductField("collections", value)
                                    }
                                />
                            </div>
                        </div>

                        <div className="flex flex-wrap gap-5">
                            <label className="flex items-center gap-2 text-sm">
                                <Checkbox
                                    checked={!!product.active}
                                    onCheckedChange={(checked) =>
                                        updateProductField(
                                            "active",
                                            checked === true,
                                        )
                                    }
                                />
                                Show in Store
                            </label>

                            <label className="flex items-center gap-2 text-sm">
                                <Checkbox
                                    checked={!!product.is_new}
                                    onCheckedChange={(checked) =>
                                        updateProductField(
                                            "is_new",
                                            checked === true,
                                        )
                                    }
                                />
                                Is New
                            </label>
                        </div>
                    </Card>
                </section>

                {/* STEP 1: OPTIONS */}
                <section className="space-y-3">
                    <div>
                        <div className="flex items-center gap-2">
                            <span className="flex h-7 w-7 items-center justify-center rounded-full bg-primary text-sm font-semibold text-primary-foreground">
                                1
                            </span>
                            <h3 className="text-base font-semibold">
                                What can customers choose?
                            </h3>
                        </div>
                        <p className="mt-1 text-sm text-muted-foreground">
                            Add sizes, colors, volumes or any other choices.
                        </p>
                    </div>

                    <Card className="space-y-4 p-3 sm:p-4">
                        {options.map((option, index) => (
                            <div
                                key={`${option.name}-${index}`}
                                className="space-y-3 rounded-xl border bg-muted/20 p-3"
                            >
                                <div className="flex items-center justify-between gap-2">
                                    <div>
                                        <p className="font-semibold">
                                            {option.name}
                                        </p>
                                        <p className="text-xs text-muted-foreground">
                                            {option.values.length} available
                                            choices
                                        </p>
                                    </div>

                                    <Button
                                        type="button"
                                        size="icon"
                                        variant="ghost"
                                        className="shrink-0 text-destructive"
                                        onClick={() => removeOption(index)}
                                        aria-label={`Remove ${option.name}`}
                                    >
                                        <Trash2 className="h-4 w-4" />
                                    </Button>
                                </div>

                                <div className="flex flex-wrap gap-2">
                                    {option.values.map((value) => (
                                        <span
                                            key={value}
                                            className="inline-flex items-center gap-1 rounded-full border bg-background px-3 py-1.5 text-sm"
                                        >
                                            {value}
                                            <button
                                                type="button"
                                                className="rounded-full p-0.5 text-muted-foreground hover:text-destructive"
                                                aria-label={`Remove ${value}`}
                                                onClick={() =>
                                                    removeOptionValue(
                                                        index,
                                                        value,
                                                    )
                                                }
                                            >
                                                <X className="h-3.5 w-3.5" />
                                            </button>
                                        </span>
                                    ))}
                                </div>

                                <div className="flex gap-2">
                                    <Input
                                        placeholder={`Add another ${option.name.toLowerCase()}...`}
                                        value={valueInputs[index] ?? ""}
                                        onChange={(event) =>
                                            setValueInputs((previous) => ({
                                                ...previous,
                                                [index]: event.target.value,
                                            }))
                                        }
                                        onKeyDown={(event) => {
                                            if (event.key === "Enter") {
                                                event.preventDefault();
                                                addOptionValue(index);
                                            }
                                        }}
                                    />
                                    <Button
                                        type="button"
                                        variant="outline"
                                        size="icon"
                                        className="h-11 w-11 shrink-0"
                                        disabled={
                                            !(valueInputs[index] ?? "").trim()
                                        }
                                        onClick={() => addOptionValue(index)}
                                        aria-label="Add choice"
                                    >
                                        <Plus className="h-4 w-4" />
                                    </Button>
                                </div>
                            </div>
                        ))}

                        <div className="space-y-3 rounded-xl border border-dashed p-3">
                            <div>
                                <p className="font-medium">
                                    {options.length
                                        ? "Add another option"
                                        : "Add your first option"}
                                </p>
                                <p className="text-xs text-muted-foreground">
                                    For example: Size, Color, Volume or
                                    Width.
                                </p>
                            </div>

                            <div className="space-y-2">
                                <Label>Choose an option</Label>
                                <Select
                                    value={selectedAttribute}
                                    onValueChange={(value) => {
                                        setSelectedAttribute(value);
                                        setCustomAttributeName("");
                                        setOptionMessage("");
                                    }}
                                >
                                    <SelectTrigger className="h-12">
                                        <SelectValue placeholder="Select an option..." />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {COMMON_ATTRIBUTES.filter(
                                            (name) =>
                                                !options.some(
                                                    (option) =>
                                                        option.name.toLowerCase() ===
                                                        name.toLowerCase(),
                                                ),
                                        ).map((name) => (
                                            <SelectItem
                                                key={name}
                                                value={name}
                                            >
                                                {name}
                                            </SelectItem>
                                        ))}
                                        <SelectItem value="custom">
                                            Create my own option
                                        </SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>

                            {isCustomAttribute && (
                                <div className="space-y-2">
                                    <Label>What should it be called?</Label>
                                    <Input
                                        placeholder="e.g. Fragrance, Model, Fit"
                                        value={customAttributeName}
                                        onChange={(event) =>
                                            setCustomAttributeName(
                                                event.target.value,
                                            )
                                        }
                                    />
                                </div>
                            )}

                            {selectedAttribute && (
                                <div className="space-y-3">
                                    <Label>Enter the available choices</Label>

                                    <div className="flex gap-2">
                                        <Input
                                            placeholder="Enter one choice, e.g. 50ml"
                                            value={valueInput}
                                            onChange={(event) =>
                                                setValueInput(
                                                    event.target.value,
                                                )
                                            }
                                            onKeyDown={(event) => {
                                                if (event.key === "Enter") {
                                                    event.preventDefault();
                                                    addDraftValue();
                                                }
                                            }}
                                        />
                                        <Button
                                            type="button"
                                            variant="outline"
                                            className="h-11 shrink-0"
                                            disabled={!valueInput.trim()}
                                            onClick={addDraftValue}
                                        >
                                            <Plus className="h-4 w-4" />
                                            Add
                                        </Button>
                                    </div>

                                    {draftValues.length > 0 && (
                                        <div className="flex flex-wrap gap-2 rounded-lg bg-muted/40 p-3">
                                            {draftValues.map((value) => (
                                                <span
                                                    key={value}
                                                    className="inline-flex items-center gap-1 rounded-full border bg-background px-3 py-1.5 text-sm"
                                                >
                                                    {value}
                                                    <button
                                                        type="button"
                                                        onClick={() =>
                                                            removeDraftValue(
                                                                value,
                                                            )
                                                        }
                                                        aria-label={`Remove ${value}`}
                                                    >
                                                        <X className="h-3.5 w-3.5" />
                                                    </button>
                                                </span>
                                            ))}
                                        </div>
                                    )}

                                    <Button
                                        type="button"
                                        className="h-11 w-full"
                                        disabled={
                                            !attributeName ||
                                            (!draftValues.length &&
                                                !valueInput.trim()) ||
                                            options.some(
                                                (option) =>
                                                    option.name.toLowerCase() ===
                                                    attributeName.toLowerCase(),
                                            )
                                        }
                                        onClick={addOption}
                                    >
                                        <Plus className="h-4 w-4" />
                                        Save this option
                                    </Button>
                                </div>
                            )}

                            {optionMessage && (
                                <p className="rounded-lg bg-muted p-3 text-sm text-destructive">
                                    {optionMessage}
                                </p>
                            )}
                        </div>

                        {options.length === 0 && (
                            <div className="flex gap-2 rounded-lg bg-blue-50 p-3 text-sm text-blue-800 dark:bg-blue-950/30 dark:text-blue-200">
                                <Info className="mt-0.5 h-4 w-4 shrink-0" />
                                <p>
                                    If customers don't need to choose anything,
                                    leave this section empty. You can set one
                                    price and stock quantity.
                                </p>
                            </div>
                        )}
                    </Card>
                </section>

                {/* STEP 2: PRICE AND STOCK */}
                <section className="space-y-3">
                    <div>
                        <div className="flex items-center gap-2">
                            <span className="flex h-7 w-7 items-center justify-center rounded-full bg-primary text-sm font-semibold text-primary-foreground">
                                2
                            </span>
                            <h3 className="text-base font-semibold">
                                Set price and stock
                            </h3>
                        </div>
                        <p className="mt-1 text-sm text-muted-foreground">
                            {options.length > 0
                                ? "Every combination of your choices is listed here. Leave the quantity at 0 for any you don't have. It will show as out of stock and needs no price."
                                : "Enter the price and how many you have."}
                        </p>
                    </div>

                    <Card className="space-y-3 p-3 sm:p-4">
                        {changeMessage && (
                            <p className="rounded-lg bg-muted p-3 text-sm">
                                {changeMessage}
                            </p>
                        )}

                        <div className="flex items-center justify-between gap-2">
                            <p className="text-sm font-semibold">
                                {options.length > 0
                                    ? `${variants.length} combination${variants.length === 1 ? "" : "s"}`
                                    : "1 item"}
                            </p>
                            <span className="text-xs text-muted-foreground">
                                Prices in ₦
                            </span>
                        </div>

                        {variants.length > 1 && (
                            <div className="grid gap-3 rounded-xl border border-dashed p-3 sm:grid-cols-2">
                                <div className="space-y-1">
                                    <Label className="text-xs" htmlFor="all-price">
                                        Same price for all (₦)
                                    </Label>
                                    <div className="flex gap-2">
                                        <Input
                                            id="all-price"
                                            type="number"
                                            inputMode="decimal"
                                            min="2"
                                            step="1"
                                            className="h-11"
                                            placeholder="e.g. 5000"
                                            value={allPrice}
                                            onChange={(event) =>
                                                setAllPrice(event.target.value)
                                            }
                                        />
                                        <Button
                                            type="button"
                                            variant="outline"
                                            className="h-11 shrink-0"
                                            disabled={Number(allPrice) < 2}
                                            onClick={applyPriceToAll}
                                        >
                                            Apply
                                        </Button>
                                    </div>
                                </div>
                                <div className="space-y-1">
                                    <Label className="text-xs" htmlFor="all-quantity">
                                        Same quantity for all
                                    </Label>
                                    <div className="flex gap-2">
                                        <Input
                                            id="all-quantity"
                                            type="number"
                                            inputMode="numeric"
                                            min="0"
                                            step="1"
                                            className="h-11"
                                            placeholder="e.g. 10"
                                            value={allQuantity}
                                            onChange={(event) =>
                                                setAllQuantity(event.target.value)
                                            }
                                        />
                                        <Button
                                            type="button"
                                            variant="outline"
                                            className="h-11 shrink-0"
                                            disabled={
                                                allQuantity.trim() === "" ||
                                                Number.parseInt(allQuantity, 10) < 0
                                            }
                                            onClick={applyQuantityToAll}
                                        >
                                            Apply
                                        </Button>
                                    </div>
                                </div>
                                <p className="text-xs text-muted-foreground sm:col-span-2">
                                    Fills every combination below. You can still change each one.
                                </p>
                            </div>
                        )}

                        <div className="space-y-3">
                            {variants.map((variant) => (
                                <div
                                    key={variant.uid}
                                    className={cn(
                                        "space-y-3 rounded-xl border p-3",
                                        !variant.id &&
                                        !!currentProduct?.id &&
                                        "border-amber-400 bg-amber-50/50 dark:bg-amber-950/20",
                                    )}
                                >
                                    <div className="flex items-start justify-between gap-2">
                                        <div>
                                            <p className="text-sm font-semibold">
                                                {describeVariant(
                                                    variant.attributes,
                                                    " / ",
                                                )}
                                            </p>
                                            {variant.sku && (
                                                <p className="mt-1 text-xs text-muted-foreground">
                                                    SKU: {variant.sku}
                                                </p>
                                            )}
                                            {!variant.id &&
                                                !!currentProduct?.id && (
                                                    <p className="mt-1 text-xs font-medium text-amber-700 dark:text-amber-300">
                                                        New. Enter price and quantity.
                                                    </p>
                                                )}
                                        </div>
                                        <span
                                            className={cn(
                                                "shrink-0 rounded-full px-2 py-1 text-xs font-medium text-white",
                                                variant.inventory === 0
                                                    ? "bg-destructive"
                                                    : "bg-emerald-800",
                                            )}
                                        >
                                            {variant.inventory === 0
                                                ? "Out of stock"
                                                : `Stock: ${variant.inventory}`}
                                        </span>
                                    </div>

                                    <div className="grid grid-cols-2 gap-3">
                                        <div className="space-y-1">
                                            <Label
                                                className="text-xs"
                                                htmlFor={`price-${variant.uid}`}
                                            >
                                                Price (₦)
                                            </Label>
                                            <Input
                                                id={`price-${variant.uid}`}
                                                type="number"
                                                inputMode="decimal"
                                                min="2"
                                                step="1"
                                                className={`h-11 ${variant.inventory > 0 && variant.price < 2 ? "border-destructive" : ""}`}
                                                value={variant.price || ""}
                                                placeholder={variant.inventory > 0 ? "e.g. 5000" : "Not needed"}
                                                onChange={(event) =>
                                                    updateVariant(variant.uid, {
                                                        price:
                                                            Number(
                                                                event.target.value,
                                                            ) || 0,
                                                    })
                                                }
                                            />
                                        </div>

                                        <div className="space-y-1">
                                            <Label
                                                className="text-xs"
                                                htmlFor={`stock-${variant.uid}`}
                                            >
                                                Quantity
                                            </Label>
                                            <Input
                                                id={`stock-${variant.uid}`}
                                                type="number"
                                                inputMode="numeric"
                                                min="0"
                                                step="1"
                                                className="h-11"
                                                value={variant.inventory}
                                                onChange={(event) =>
                                                    updateVariant(variant.uid, {
                                                        inventory: Math.max(
                                                            0,
                                                            Number.parseInt(
                                                                event.target.value,
                                                                10,
                                                            ) || 0,
                                                        ),
                                                    })
                                                }
                                            />
                                        </div>
                                    </div>

                                    <details className="text-sm">
                                        <summary className="cursor-pointer text-muted-foreground">
                                            Add previous price (optional)
                                        </summary>
                                        <div className="mt-2 space-y-1">
                                            <Label
                                                className="text-xs"
                                                htmlFor={`old-price-${variant.uid}`}
                                            >
                                                Previous price (₦)
                                            </Label>
                                            <Input
                                                id={`old-price-${variant.uid}`}
                                                type="number"
                                                inputMode="decimal"
                                                min="0"
                                                step="1"
                                                className="h-11"
                                                value={variant.old_price || ""}
                                                placeholder="Optional"
                                                onChange={(event) =>
                                                    updateVariant(variant.uid, {
                                                        old_price:
                                                            Number(
                                                                event.target.value,
                                                            ) || 0,
                                                    })
                                                }
                                            />
                                        </div>
                                    </details>
                                </div>
                            ))}
                        </div>
                    </Card>
                </section>
            </div>

            {/* WHY SAVE IS DISABLED */}
            {saveBlockers.length > 0 && (
                <div className="border-t bg-amber-50 px-3 py-2 text-xs text-amber-900 dark:bg-amber-950/30 dark:text-amber-200 sm:px-4">
                    {saveBlockers.map((message) => (
                        <p key={message}>• {message}</p>
                    ))}
                </div>
            )}

            {/* STICKY MOBILE ACTIONS */}
            <div className="sheet-footer sticky bottom-0 z-10 flex items-center justify-between gap-2 border-t bg-background px-3 py-3 pb-[calc(env(safe-area-inset-bottom)+0.75rem)] sm:px-4">
                <Button
                    type="button"
                    variant="outline"
                    className="h-11 flex-1 sm:flex-none"
                    onClick={onClose}
                >
                    Close
                </Button>

                <Button
                    type="button"
                    className="h-11 flex-1 sm:flex-none"
                    disabled={isDisabled}
                    isLoading={isPending}
                    onClick={handleSubmit}
                >
                    Save Product
                </Button>
            </div>
        </div>
    );
}