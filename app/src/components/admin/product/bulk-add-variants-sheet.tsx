import { useMemo, useState } from "react";
import { Plus, Trash2, X } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useBulkAddProductVariants } from "@/hooks/useGallery";
import type { ProductOption } from "@/schemas";

type EditableVariant = { attributes: Record<string, string>; price: number; old_price: number; inventory: number };
const MAX_VARIANTS = 500;
const COMMON_ATTRIBUTES = [
    "Size",
    "Color",
    "Width",
    "Age",
    "Length",
    "Waist",
    
];
const keyOf = (attributes: Record<string, string>) => Object.entries(attributes).sort(([a], [b]) => a.localeCompare(b)).map(([key, value]) => `${key}:${value}`).join("|");

function buildCombinations(options: ProductOption[]) {
    return options.reduce<Record<string, string>[]>((rows, option) => rows.flatMap((row) => option.values.map((value) => ({ ...row, [option.name]: value }))), [{}]);
}

interface Props { productIds: number[]; onClose: () => void }

export function BulkAddVariantsSheet({ productIds, onClose }: Props) {
    const { mutateAsync, isPending } = useBulkAddProductVariants();
    const [options, setOptions] = useState<ProductOption[]>([]);
    const [attributeName, setAttributeName] = useState("");
    const [valueDraft, setValueDraft] = useState("");
    const [variants, setVariants] = useState<EditableVariant[]>([]);
    const [confirmSharedStructure, setConfirmSharedStructure] = useState(false);
    const [defaultPrice, setDefaultPrice] = useState(0);
    const [defaultOldPrice, setDefaultOldPrice] = useState(0);
    const [defaultInventory, setDefaultInventory] = useState(0);

    const attributeChoices = useMemo(() => Array.from(new Set([...COMMON_ATTRIBUTES, ...options.map((option) => option.name)])), [options]);
    const combinationCount = options.reduce((total, option) => total * option.values.length, 1);
    const optionsComplete = options.length > 0 && options.every((option) => option.values.length > 0);
    // The list always matches the options. It is only out of date while an
    // attribute has no values yet or there are too many combinations.
    const inSync = optionsComplete && combinationCount <= MAX_VARIANTS && variants.length === combinationCount;

    // Every change to the attributes updates the combinations straight away.
    // Matching combinations keep what was already entered; new ones start from the "set for all" values.
    const rebuild = (nextOptions: ProductOption[]) => {
        setOptions(nextOptions);
        const complete = nextOptions.length > 0 && nextOptions.every((option) => option.values.length > 0);
        const count = nextOptions.reduce((total, option) => total * option.values.length, 1);
        if (!complete || count > MAX_VARIANTS) return;
        const old = new Map(variants.map((variant) => [keyOf(variant.attributes), variant]));
        setVariants(buildCombinations(nextOptions).map((attributes) => old.get(keyOf(attributes)) ?? ({ attributes, price: defaultPrice, old_price: defaultOldPrice, inventory: defaultInventory })));
    };
    const addValue = (raw = valueDraft) => {
        const values = raw.split(/[\n,]/).map((value) => value.trim()).filter(Boolean);
        if (!values.length || !attributeName) return;
        rebuild(options.map((option) => option.name === attributeName ? { ...option, values: Array.from(new Set([...option.values, ...values])) } : option));
        setValueDraft("");
    };
    const addAttribute = () => {
        if (!attributeName || options.some((option) => option.name === attributeName)) return;
        rebuild([...options, { name: attributeName, values: [] }]);
    };
    const removeAttribute = (name: string) => {
        rebuild(options.filter((option) => option.name !== name));
        if (attributeName === name) setAttributeName("");
    };
    const removeValue = (name: string, value: string) => {
        rebuild(options.map((option) => option.name === name ? { ...option, values: option.values.filter((item) => item !== value) } : option));
    };
    // "Set for all": fills every row now and is used for rows added later.
    const setForAll = (patch: Partial<EditableVariant>) => setVariants((previous) => previous.map((variant) => ({ ...variant, ...patch })));
    const updateVariant = (index: number, patch: Partial<EditableVariant>) => setVariants((previous) => previous.map((variant, i) => i === index ? { ...variant, ...patch } : variant));
    // A combination with quantity 0 is just out of stock, so it needs no price of its own.
    const fallbackPrice = variants.find((variant) => variant.price > 0)?.price;
    const canSubmit = inSync && confirmSharedStructure && fallbackPrice !== undefined && variants.every((variant) => variant.inventory >= 0 && (variant.inventory === 0 || variant.price > 0));

    const submit = async () => {
        try {
            await mutateAsync({ productIds, input: { options, variants: variants.map((variant) => ({ ...variant, price: variant.price > 0 ? variant.price : (fallbackPrice as number) })) } });
            toast.success(`Variant structure applied to ${productIds.length} products`);
            onClose();
        } catch {
            // Mutation hook displays the API error.
        }
    };

    return (
        <div className="flex h-full min-h-0 flex-col">
            <div className="min-h-0 flex-1 space-y-4 overflow-y-auto px-1 py-3">
                <div>
                    <p className="text-sm text-muted-foreground">Apply one shared variant structure to {productIds.length} selected products. Existing matching variants keep their IDs, prices and stock.</p>
                </div>
                <Card className="space-y-4 p-3 sm:p-4">
                    <div><h3 className="font-semibold">1. Configure attributes</h3><p className="text-xs text-muted-foreground">Choose an attribute and add its values as chips.</p></div>
                    <div className="grid grid-cols-1 gap-2 sm:grid-cols-[1fr_auto]">
                        <Select value={attributeName} onValueChange={setAttributeName}>
                            <SelectTrigger><SelectValue placeholder="Select attribute" /></SelectTrigger>
                            <SelectContent>{attributeChoices.filter((name) => !options.some((option) => option.name === name)).map((name) => <SelectItem key={name} value={name}>{name}</SelectItem>)}</SelectContent>
                        </Select>
                        <Button type="button" variant="outline" onClick={addAttribute} disabled={!attributeName || options.some((option) => option.name === attributeName)}><Plus className="mr-1 h-4 w-4" />Add attribute</Button>
                    </div>
                    {options.map((option) => (
                        <div key={option.name} className="space-y-2 rounded-lg border p-3">
                            <div className="flex items-center justify-between"><Label>{option.name}</Label><Button type="button" size="icon" variant="ghost" onClick={() => removeAttribute(option.name)} aria-label={`Remove ${option.name}`}><Trash2 className="h-4 w-4" /></Button></div>
                            <div className="flex flex-wrap gap-1.5">{option.values.map((value) => <span key={value} className="inline-flex items-center gap-1 rounded-full bg-muted px-2.5 py-1 text-xs">{value}<button type="button" onClick={() => removeValue(option.name, value)} aria-label={`Remove ${value}`}><X className="h-3 w-3" /></button></span>)}</div>
                            <div className="flex gap-2"><Input value={attributeName === option.name ? valueDraft : ""} onFocus={() => setAttributeName(option.name)} onChange={(event) => { setAttributeName(option.name); setValueDraft(event.target.value); }} onKeyDown={(event) => { if (event.key === "Enter" || event.key === ",") { event.preventDefault(); addValue(); } }} placeholder="Type a value and press Enter" /><Button type="button" variant="outline" onClick={() => addValue()} disabled={!valueDraft.trim()}>Add</Button></div>
                        </div>
                    ))}
                </Card>
                <Card className="space-y-3 p-3 sm:p-4">
                    <div><h3 className="font-semibold">2. Set price and stock for all</h3><p className="text-xs text-muted-foreground">{combinationCount} combinations · Maximum {MAX_VARIANTS}. Typing here fills every combination below. You can still change each one.</p></div>
                    <div className="grid grid-cols-3 gap-2">
                        <div className="space-y-1"><Label className="text-xs">Price for all (₦)</Label><Input type="number" min="1" value={defaultPrice || ""} onChange={(event) => { const value = Number(event.target.value) || 0; setDefaultPrice(value); setForAll({ price: value }); }} /></div>
                        <div className="space-y-1"><Label className="text-xs">Old price for all (₦)</Label><Input type="number" min="0" value={defaultOldPrice || ""} onChange={(event) => { const value = Number(event.target.value) || 0; setDefaultOldPrice(value); setForAll({ old_price: value }); }} /></div>
                        <div className="space-y-1"><Label className="text-xs">Stock for all</Label><Input type="number" min="0" value={defaultInventory} onChange={(event) => { const value = Math.max(0, Math.trunc(Number(event.target.value) || 0)); setDefaultInventory(value); setForAll({ inventory: value }); }} /></div>
                    </div>
                    {!optionsComplete && <p className="text-xs text-destructive">Add at least one value to every attribute.</p>}
                    {optionsComplete && combinationCount > MAX_VARIANTS && <p className="text-xs text-destructive">Too many combinations. Remove some values.</p>}
                </Card>
                {inSync && <Card className="space-y-3 p-3 sm:p-4">
                    <div><h3 className="font-semibold">3. Review combinations</h3><p className="text-xs text-muted-foreground">Leave the stock at 0 for combinations you don't have. They show as out of stock and need no price. Existing matching variants keep their own price and stock.</p></div>
                    {variants.map((variant, index) => <div key={keyOf(variant.attributes)} className="space-y-2 rounded-lg border p-3">
                        <div className="flex flex-wrap gap-1.5">{Object.entries(variant.attributes).map(([name, value]) => <span key={name} className="rounded-full bg-muted px-2 py-1 text-xs">{name}: {value}</span>)}</div>
                        <div className="grid grid-cols-3 gap-2">
                            <div className="space-y-1"><Label className="text-xs">Price (₦)</Label><Input type="number" min="1" placeholder={variant.inventory > 0 ? "" : "Not needed"} value={variant.price || ""} onChange={(event) => updateVariant(index, { price: Number(event.target.value) || 0 })} /></div>
                            <div className="space-y-1"><Label className="text-xs">Old price</Label><Input type="number" min="0" value={variant.old_price || ""} onChange={(event) => updateVariant(index, { old_price: Number(event.target.value) || 0 })} /></div>
                            <div className="space-y-1"><Label className="text-xs">Stock</Label><Input type="number" min="0" value={variant.inventory} onChange={(event) => updateVariant(index, { inventory: Math.max(0, Math.trunc(Number(event.target.value) || 0)) })} /></div>
                        </div>
                    </div>)}
                </Card>}
                <div className="flex items-start gap-2 rounded-lg border border-amber-500/30 bg-amber-500/5 p-3">
                    <Checkbox id="confirm-shared-variant-structure" checked={confirmSharedStructure} onCheckedChange={(checked) => setConfirmSharedStructure(checked === true)} />
                    <label htmlFor="confirm-shared-variant-structure" className="text-xs leading-relaxed">I confirm these products should share this variant structure. Existing combinations that do not match will be retired (inventory set to zero).</label>
                </div>
                <p className="text-xs text-muted-foreground">Products with different variant structures should be configured individually.</p>
            </div>
            <div className="flex shrink-0 justify-end gap-2 border-t bg-background py-3"><Button variant="outline" onClick={onClose}>Cancel</Button><Button onClick={submit} disabled={!canSubmit || isPending} isLoading={isPending}>Apply to {productIds.length} products</Button></div>
        </div>
    );
}
