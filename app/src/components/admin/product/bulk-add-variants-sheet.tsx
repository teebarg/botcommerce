import { useMemo, useState } from "react";
import { Plus, Trash2, WandSparkles, X } from "lucide-react";
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
const COMMON_ATTRIBUTES = ["Size", "Colour", "Color", "Width", "Length", "Age", "Volume", "Material"];
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
    const [generated, setGenerated] = useState(false);
    const [confirmSharedStructure, setConfirmSharedStructure] = useState(false);
    const [defaultPrice, setDefaultPrice] = useState(0);
    const [defaultOldPrice, setDefaultOldPrice] = useState(0);
    const [defaultInventory, setDefaultInventory] = useState(0);

    const attributeChoices = useMemo(() => Array.from(new Set([...COMMON_ATTRIBUTES, ...options.map((option) => option.name)])), [options]);
    const combinationCount = options.reduce((total, option) => total * option.values.length, 1);
    const addValue = (raw = valueDraft) => {
        const values = raw.split(/[\n,]/).map((value) => value.trim()).filter(Boolean);
        if (!values.length || !attributeName) return;
        setOptions((previous) => previous.map((option) => option.name === attributeName ? { ...option, values: Array.from(new Set([...option.values, ...values])) } : option));
        setValueDraft("");
        setGenerated(false);
    };
    const addAttribute = () => {
        if (!attributeName || options.some((option) => option.name === attributeName)) return;
        setOptions((previous) => [...previous, { name: attributeName, values: [] }]);
    };
    const removeAttribute = (name: string) => {
        setOptions((previous) => previous.filter((option) => option.name !== name));
        if (attributeName === name) setAttributeName("");
        setGenerated(false);
    };
    const removeValue = (name: string, value: string) => {
        setOptions((previous) => previous.map((option) => option.name === name ? { ...option, values: option.values.filter((item) => item !== value) } : option));
        setGenerated(false);
    };
    const generate = () => {
        if (!options.length || options.some((option) => !option.values.length) || combinationCount > MAX_VARIANTS) return;
        const old = new Map(variants.map((variant) => [keyOf(variant.attributes), variant]));
        setVariants(buildCombinations(options).map((attributes) => old.get(keyOf(attributes)) ?? ({ attributes, price: defaultPrice, old_price: defaultOldPrice, inventory: defaultInventory })));
        setGenerated(true);
    };
    const updateVariant = (index: number, patch: Partial<EditableVariant>) => setVariants((previous) => previous.map((variant, i) => i === index ? { ...variant, ...patch } : variant));
    const canSubmit = generated && confirmSharedStructure && variants.length > 0 && variants.every((variant) => variant.price > 0 && variant.inventory >= 0);

    const submit = async () => {
        try {
            await mutateAsync({ productIds, input: { options, variants } });
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
                    <div><h3 className="font-semibold">2. Generate combinations</h3><p className="text-xs text-muted-foreground">{combinationCount} possible combinations · Maximum {MAX_VARIANTS}.</p></div>
                    <div className="grid grid-cols-3 gap-2">
                        <div className="space-y-1"><Label className="text-xs">Default price (₦)</Label><Input type="number" min="1" value={defaultPrice || ""} onChange={(event) => setDefaultPrice(Number(event.target.value) || 0)} /></div>
                        <div className="space-y-1"><Label className="text-xs">Old price (₦)</Label><Input type="number" min="0" value={defaultOldPrice || ""} onChange={(event) => setDefaultOldPrice(Number(event.target.value) || 0)} /></div>
                        <div className="space-y-1"><Label className="text-xs">Default stock</Label><Input type="number" min="0" value={defaultInventory} onChange={(event) => setDefaultInventory(Math.max(0, Math.trunc(Number(event.target.value) || 0)))} /></div>
                    </div>
                    <Button type="button" onClick={generate} disabled={!options.length || options.some((option) => !option.values.length) || combinationCount > MAX_VARIANTS}><WandSparkles className="mr-2 h-4 w-4" />Generate variants</Button>
                </Card>
                {generated && <Card className="space-y-3 p-3 sm:p-4">
                    <div><h3 className="font-semibold">3. Review variant defaults</h3><p className="text-xs text-muted-foreground">These values are used for new combinations. Existing matching variants retain their own price and inventory.</p></div>
                    {variants.map((variant, index) => <div key={keyOf(variant.attributes)} className="space-y-2 rounded-lg border p-3">
                        <div className="flex flex-wrap gap-1.5">{Object.entries(variant.attributes).map(([name, value]) => <span key={name} className="rounded-full bg-muted px-2 py-1 text-xs">{name}: {value}</span>)}</div>
                        <div className="grid grid-cols-3 gap-2">
                            <div className="space-y-1"><Label className="text-xs">Price (₦)</Label><Input type="number" min="1" value={variant.price || ""} onChange={(event) => updateVariant(index, { price: Number(event.target.value) || 0 })} /></div>
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
