import { useMemo, useState } from "react";
import {
    FileText,
    Package,
    Plus,
    Tag,
    Trash2,
    WandSparkles,
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
    selected: boolean;
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
    "Shoe Size",
    "Clothing Size",
    "Colour",
    "Volume",
    "Weight",
    "Storage",
    "Material",
    "Age",
    "Length",
    "Width",
    "Capacity",
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

// Builds the starting options and variants for the form.
// If the API doesn't return options (or returns only some of them),
// they are rebuilt from the attributes of the saved variants.
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

    const variants: EditableVariant[] = (
        (product?.variants ?? []) as any[]
    ).map((variant) => ({
        uid: makeUid(),
        id: variant.id,
        sku: variant.sku ?? undefined,
        attributes: getVariantAttributes(variant, savedOptions),
        price: Number(variant.price) || 0,
        old_price: Number(variant.old_price) || 0,
        inventory: Number(variant.inventory) || 0,
        selected: true,
    }));

    const options: ProductOption[] = savedOptions.map((option) => ({
        ...option,
        values: [...option.values],
    }));

    for (const variant of variants) {
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

    return {
        options: sanitizeOptions(options),
        variants: variants.length
            ? variants
            : [
                {
                    uid: makeUid(),
                    attributes: {},
                    price: 0,
                    old_price: 0,
                    inventory: 0,
                    selected: true,
                },
            ],
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

    const [hasGenerated, setHasGenerated] = useState(
        initial.options.length > 0 ||
        (currentProduct?.variants?.length ?? 0) > 0,
    );

    // Shown inside step 2 (result of generating).
    const [generationMessage, setGenerationMessage] = useState("");
    // Shown inside step 1 right next to the option builder, so errors like
    // "already exists" are visible where the admin is working.
    const [optionMessage, setOptionMessage] = useState("");

    const isCustomAttribute = selectedAttribute === "custom";

    const attributeName = isCustomAttribute
        ? customAttributeName.trim()
        : selectedAttribute.trim();

    const totalVariants = useMemo(() => {
        if (!options.length) return 1;

        return options.reduce(
            (count, option) => count * option.values.length,
            1,
        );
    }, [options]);

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

    // Single source of truth for "why can't I generate?".
    const generateBlockReason = invalidOptions
        ? "Check your options. Each option needs a name and at least one unique choice."
        : totalVariants > MAX_VARIANTS
            ? `Too many combinations (${totalVariants}). Reduce the choices to ${MAX_VARIANTS} or fewer.`
            : "";

    const selectedVariants = variants.filter(
        (variant) => variant.selected,
    );

    const isVariantInvalid = (variant: EditableVariant) =>
        !Number.isFinite(variant.price) ||
        variant.price < 2 ||
        !Number.isFinite(variant.inventory) ||
        variant.inventory < 0 ||
        !Number.isInteger(variant.inventory);

    const invalidVariantCount = selectedVariants.filter(isVariantInvalid)
        .length;

    const invalidVariants = invalidVariantCount > 0;

    const isDisabled =
        !product.name?.trim() ||
        invalidOptions ||
        variants.length === 0 ||
        !hasGenerated ||
        selectedVariants.length === 0 ||
        invalidVariants;

    // Tell the admin exactly why Save is disabled.
    const saveBlockers: string[] = [];
    if (!product.name?.trim()) saveBlockers.push("Enter a product name.");
    if (invalidOptions)
        saveBlockers.push(
            "Each option needs a name and unique, non-empty choices.",
        );
    if (!hasGenerated)
        saveBlockers.push(
            "You changed the options. Tap “Regenerate combinations” first.",
        );
    if (hasGenerated && selectedVariants.length === 0)
        saveBlockers.push("Select at least one combination.");
    if (invalidVariantCount > 0)
        saveBlockers.push(
            `${invalidVariantCount} selected item(s) need a price of ₦2 or more.`,
        );

    const updateProductField = (
        field: keyof FormProduct,
        value: string | boolean | SelectOption[],
    ) => {
        setProduct(
            (previous) => ({ ...previous, [field]: value }) as FormProduct,
        );
    };

    // Keep existing variants until the admin explicitly regenerates them.
    // This prevents losing data while editing attribute values.
    const updateOptions = (nextOptions: ProductOption[]) => {
        setOptions(nextOptions);
        setHasGenerated(false);
        setGenerationMessage("");
        setOptionMessage("");
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

        updateOptions([...options, { name, values: [...values] }]);

        resetAttributeBuilder();
    };

    const removeOption = (index: number) => {
        updateOptions(
            options.filter((_, optionIndex) => optionIndex !== index),
        );
        // valueInputs is keyed by index, so it must be cleared when indexes shift.
        setValueInputs({});
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

        updateOptions(
            options.map((item, optionIndex) =>
                optionIndex === index
                    ? {
                        ...item,
                        values: [...item.values, value],
                    }
                    : item,
            ),
        );

        setValueInputs((previous) => ({
            ...previous,
            [index]: "",
        }));
    };

    const removeOptionValue = (
        optionIndex: number,
        value: string,
    ) => {
        updateOptions(
            options.map((option, index) =>
                index === optionIndex
                    ? {
                        ...option,
                        values: option.values.filter(
                            (item) => item !== value,
                        ),
                    }
                    : option,
            ),
        );
    };

    // Generate from the latest options state.
    // Matching variants keep their IDs, prices, stock and selection.
    const generateVariants = () => {
        setGenerationMessage("");

        if (options.length === 0) {
            setVariants((previous) => {
                const base =
                    previous.find(
                        (item) => !Object.keys(item.attributes).length,
                    ) ?? previous[0];

                return [
                    {
                        uid: base?.uid ?? makeUid(),
                        id: base?.id,
                        sku: base?.sku,
                        attributes: {},
                        price: base?.price ?? 0,
                        old_price: base?.old_price ?? 0,
                        inventory: base?.inventory ?? 0,
                        selected: true,
                    },
                ];
            });
            setHasGenerated(true);
            return;
        }

        if (generateBlockReason) {
            setGenerationMessage(generateBlockReason);
            return;
        }

        const combinations = buildCombinations(options);

        if (!combinations.length) {
            setGenerationMessage(
                "No combinations could be created. Check your options and try again.",
            );
            return;
        }

        const existing = variants.map((variant) => ({
            variant,
            key: combinationKey(variant.attributes),
            norm: normalize(variant.attributes),
        }));

        const claimed = new Set<number>();

        // Pass 1: exact matches keep id, price and stock.
        const results: (EditableVariant | null)[] = combinations.map(
            (attributes) => {
                const key = combinationKey(attributes);
                const idx = existing.findIndex(
                    (item, i) => !claimed.has(i) && item.key === key,
                );
                if (idx === -1) return null;
                claimed.add(idx);
                return { ...existing[idx].variant, attributes };
            },
        );

        // Pass 2: combinations with no exact match. This covers adding a new
        // option to an existing product, or removing one.
        const generated: EditableVariant[] = combinations.map(
            (attributes, i) => {
                const exact = results[i];
                if (exact) return exact;

                const norm = normalize(attributes);
                const related = (item: (typeof existing)[number]) =>
                    isSubset(item.norm, norm) || isSubset(norm, item.norm);

                // Take over an unclaimed old variant (keeps id and stock)
                const freeIdx = existing.findIndex(
                    (item, idx) => !claimed.has(idx) && related(item),
                );
                if (freeIdx !== -1) {
                    claimed.add(freeIdx);
                    return { ...existing[freeIdx].variant, attributes };
                }

                // Otherwise copy only the price from a related variant
                const template = existing.find(related)?.variant;

                return {
                    uid: makeUid(),
                    attributes,
                    price: template?.price ?? 0,
                    old_price: template?.old_price ?? 0,
                    inventory: 0,
                    selected: true,
                };
            },
        );

        const keptCount = generated.filter((item) => item.id).length;
        const newCount = generated.length - keptCount;
        const removedCount = existing.filter(
            (_, idx) => !claimed.has(idx),
        ).length;

        setVariants(generated);
        setHasGenerated(true);
        setGenerationMessage(
            `${generated.length} combinations: ${keptCount} kept with their existing price and stock, ${newCount} new` +
            (removedCount > 0 ? `, ${removedCount} old removed` : "") +
            ". " +
            (newCount > 0
                ? "Set quantity (and price if empty) for the new ones in step 3."
                : ""),
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

    const toggleAllVariants = (checked: boolean) => {
        setVariants((previous) =>
            previous.map((variant) => ({
                ...variant,
                selected: checked,
            })),
        );
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
            variants: selectedVariants.map((variant) => ({
                id: variant.id,
                price: variant.price,
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

    const allSelected = variants.every((variant) => variant.selected);

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
                            Add sizes, colours, volumes or any other choices.
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
                                    For example: Size, Colour, Volume or
                                    Storage.
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

                {/* STEP 2: GENERATE AND SELECT */}
                <section className="space-y-3">
                    <div>
                        <div className="flex items-center gap-2">
                            <span className="flex h-7 w-7 items-center justify-center rounded-full bg-primary text-sm font-semibold text-primary-foreground">
                                2
                            </span>
                            <h3 className="text-base font-semibold">
                                Choose the combinations you sell
                            </h3>
                        </div>
                        <p className="mt-1 text-sm text-muted-foreground">
                            We will put the choices together. Remove anything
                            you don't sell.
                        </p>
                    </div>

                    <Card className="space-y-3 p-3 sm:p-4">
                        {options.length > 0 ? (
                            <>
                                <div className="rounded-lg bg-muted/50 p-3">
                                    {options.map((option) => (
                                        <p
                                            key={option.name}
                                            className="text-sm"
                                        >
                                            <strong>{option.name}:</strong>{" "}
                                            {option.values.join(", ")}
                                        </p>
                                    ))}
                                    <p className="mt-2 text-xs text-muted-foreground">
                                        {totalVariants} possible combinations.
                                    </p>
                                </div>

                                <Button
                                    type="button"
                                    className="h-12 w-full"
                                    disabled={!!generateBlockReason}
                                    onClick={generateVariants}
                                >
                                    <WandSparkles className="h-4 w-4" />
                                    {hasGenerated
                                        ? "Regenerate combinations"
                                        : "Generate combinations"}
                                </Button>

                                {generateBlockReason && (
                                    <p className="text-sm text-destructive">
                                        {generateBlockReason}
                                    </p>
                                )}
                            </>
                        ) : (
                            <>
                                <p className="text-sm text-muted-foreground">
                                    This product has no options. It will have
                                    one default combination.
                                </p>
                                <Button
                                    type="button"
                                    variant="outline"
                                    className="h-11 w-full"
                                    onClick={generateVariants}
                                >
                                    Use one price and stock
                                </Button>
                            </>
                        )}

                        {generationMessage && (
                            <p className="rounded-lg bg-muted p-3 text-sm">
                                {generationMessage}
                            </p>
                        )}

                        {hasGenerated && variants.length > 0 && (
                            <div className="space-y-3 border-t pt-3">
                                <div className="flex flex-wrap items-center justify-between gap-2">
                                    <div>
                                        <p className="font-semibold">
                                            Select what you actually sell
                                        </p>
                                        <p className="text-xs text-muted-foreground">
                                            Untick combinations you don't
                                            have.
                                        </p>
                                    </div>

                                    <Button
                                        type="button"
                                        size="sm"
                                        variant="outline"
                                        onClick={() =>
                                            toggleAllVariants(!allSelected)
                                        }
                                    >
                                        {allSelected
                                            ? "Untick all"
                                            : "Select all"}
                                    </Button>
                                </div>

                                <div className="space-y-2">
                                    {variants.map((variant) => (
                                        <label
                                            key={variant.uid}
                                            className={`flex min-h-14 cursor-pointer items-center gap-3 rounded-lg border p-3 ${variant.selected
                                                ? "border-primary/50 bg-primary/5"
                                                : "bg-muted/20 opacity-70"
                                                }`}
                                        >
                                            <Checkbox
                                                checked={variant.selected}
                                                onCheckedChange={(checked) =>
                                                    updateVariant(variant.uid, {
                                                        selected:
                                                            checked === true,
                                                    })
                                                }
                                            />

                                            <span className="min-w-0 flex-1 text-sm font-medium">
                                                {describeVariant(
                                                    variant.attributes,
                                                    " · ",
                                                )}
                                            </span>

                                            <span className="shrink-0 text-xs text-muted-foreground">
                                                {variant.selected
                                                    ? "Selling"
                                                    : "Not selling"}
                                            </span>
                                        </label>
                                    ))}
                                </div>

                                <p className="rounded-lg bg-primary/5 p-3 text-sm">
                                    <strong>
                                        {selectedVariants.length}
                                    </strong>{" "}
                                    selected out of {variants.length}.
                                </p>
                            </div>
                        )}
                    </Card>
                </section>

                {/* STEP 3: PRICE AND STOCK */}
                {hasGenerated && variants.length > 0 && (
                    <section className="space-y-3">
                        <div>
                            <div className="flex items-center gap-2">
                                <span className="flex h-7 w-7 items-center justify-center rounded-full bg-primary text-sm font-semibold text-primary-foreground">
                                    3
                                </span>
                                <h3 className="text-base font-semibold">
                                    Set price and stock
                                </h3>
                            </div>
                            <p className="mt-1 text-sm text-muted-foreground">
                                Enter the price and how many you have for each
                                selected combination.
                            </p>
                        </div>

                        <Card className="space-y-3 p-3 sm:p-4">
                            {selectedVariants.length === 0 ? (
                                <p className="rounded-lg bg-muted/50 p-4 text-sm text-muted-foreground">
                                    Select at least one combination above.
                                </p>
                            ) : (
                                <>
                                    <div className="flex items-center justify-between gap-2">
                                        <p className="text-sm font-semibold">
                                            {selectedVariants.length} items to
                                            price
                                        </p>
                                        <span className="text-xs text-muted-foreground">
                                            Prices in ₦
                                        </span>
                                    </div>

                                    <div className="space-y-3">
                                        {selectedVariants.map((variant) => (
                                            <div
                                                key={variant.uid}
                                                className="space-y-3 rounded-xl border p-3"
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
                                                                SKU:{" "}
                                                                {variant.sku}
                                                            </p>
                                                        )}
                                                    </div>
                                                    <span className={cn(
                                                        "shrink-0 text-xs font-medium rounded-full bg-muted px-2 py-1 text-white",
                                                        variant.inventory === 0
                                                            ? "bg-destructive"
                                                            : "bg-emerald-800",
                                                    )}>
                                                        Stock:{" "}
                                                        {variant.inventory}
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
                                                            className={`h-11 ${variant.price < 2 ? "border-destructive" : ""}`}
                                                            value={
                                                                variant.price ||
                                                                ""
                                                            }
                                                            placeholder="e.g. 5000"
                                                            onChange={(event) =>
                                                                updateVariant(
                                                                    variant.uid,
                                                                    {
                                                                        price:
                                                                            Number(
                                                                                event
                                                                                    .target
                                                                                    .value,
                                                                            ) ||
                                                                            0,
                                                                    },
                                                                )
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
                                                            value={
                                                                variant.inventory
                                                            }
                                                            onChange={(event) =>
                                                                updateVariant(
                                                                    variant.uid,
                                                                    {
                                                                        inventory:
                                                                            Math.max(
                                                                                0,
                                                                                Number.parseInt(
                                                                                    event
                                                                                        .target
                                                                                        .value,
                                                                                    10,
                                                                                ) ||
                                                                                0,
                                                                            ),
                                                                    },
                                                                )
                                                            }
                                                        />
                                                    </div>
                                                </div>

                                                <details className="text-sm">
                                                    <summary className="cursor-pointer text-muted-foreground">
                                                        Add previous price
                                                        (optional)
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
                                                            value={
                                                                variant.old_price ||
                                                                ""
                                                            }
                                                            placeholder="Optional"
                                                            onChange={(event) =>
                                                                updateVariant(
                                                                    variant.uid,
                                                                    {
                                                                        old_price:
                                                                            Number(
                                                                                event
                                                                                    .target
                                                                                    .value,
                                                                            ) ||
                                                                            0,
                                                                    },
                                                                )
                                                            }
                                                        />
                                                    </div>
                                                </details>
                                            </div>
                                        ))}
                                    </div>

                                    <div className="rounded-lg bg-muted/50 p-3 text-xs text-muted-foreground">
                                        <Info className="mr-1 inline h-3.5 w-3.5" />
                                        A quantity of zero means the
                                        combination is out of stock.
                                    </div>
                                </>
                            )}
                        </Card>
                    </section>
                )}
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