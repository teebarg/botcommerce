import { createFileRoute } from "@tanstack/react-router";
import { PageLoader } from "@/components/generic/page-loader";
import { useCreateShopSetting, useDeleteShopSetting, useSettingsQuery, useShopSettings, useUpdateShopSetting } from "@/hooks/useGeneric";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogTrigger } from "@/components/ui/dialog";
import { Trash2, Pencil, Plus, Check, X } from "lucide-react";
import { ShopSettings } from "@/schemas";

export const Route = createFileRoute("/_auth/_adminLayout/admin/settings")({
    loader: async ({ context }) => {
        await context.queryClient.ensureQueryData(useSettingsQuery());
    },
    pendingComponent: () => <PageLoader variant="detail" />,
    component: RouteComponent,
});

const isFeatureKey = (key: string) => key.startsWith("feature_");
const toBool = (value: string | null) => value === "true";

function RouteComponent() {
    const { data: settings, isLoading } = useShopSettings();
    const createMutation = useCreateShopSetting();
    const updateMutation = useUpdateShopSetting();
    const deleteMutation = useDeleteShopSetting();

    const [addOpen, setAddOpen] = useState(false);
    const [newKey, setNewKey] = useState("");
    const [newValue, setNewValue] = useState("");
    const [newFlagValue, setNewFlagValue] = useState(false);

    const [editId, setEditId] = useState<number | null>(null);
    const [editValue, setEditValue] = useState("");

    const handleCreate = () => {
        if (!newKey.trim()) return;
        const value = isFeatureKey(newKey.trim()) ? String(newFlagValue) : newValue || null;
        createMutation.mutate(
            { key: newKey.trim(), value },
            {
                onSuccess: () => {
                    setNewKey("");
                    setNewValue("");
                    setNewFlagValue(false);
                    setAddOpen(false);
                },
            }
        );
    };

    const openEdit = (id: number, value: string | null) => {
        setEditId(id);
        setEditValue(value ?? "");
    };

    const handleUpdate = () => {
        if (editId == null) return;
        updateMutation.mutate({ id: editId, input: { value: editValue || null } }, { onSuccess: () => setEditId(null) });
    };

    const handleFlagToggle = (id: number, checked: boolean) => {
        updateMutation.mutate({ id, input: { value: String(checked) } });
    };

    const handleDelete = (id: number) => {
        if (confirm("Delete this setting?")) {
            deleteMutation.mutate(id);
        }
    };

    return (
        <div className="space-y-4 p-4 sm:p-6">
            <div className="flex items-center justify-between gap-3">
                <h1 className="text-lg sm:text-xl font-semibold">Shop Settings</h1>
                <Dialog
                    open={addOpen}
                    onOpenChange={(open) => {
                        setAddOpen(open);
                        if (!open) {
                            setNewKey("");
                            setNewValue("");
                            setNewFlagValue(false);
                        }
                    }}
                >
                    <DialogTrigger asChild>
                        <Button size="sm">
                            <Plus className="h-4 w-4" />
                            <span className="hidden sm:inline">Add Setting</span>
                            <span className="sm:hidden">Add</span>
                        </Button>
                    </DialogTrigger>
                    <DialogContent>
                        <DialogHeader>
                            <DialogTitle>Add Setting</DialogTitle>
                        </DialogHeader>
                        <div className="space-y-3">
                            <Input placeholder="Key" value={newKey} onChange={(e) => setNewKey(e.target.value)} />
                            {isFeatureKey(newKey.trim()) ? (
                                <div className="flex items-center justify-between rounded-md border px-3 py-2">
                                    <span className="text-sm text-muted-foreground">Enabled</span>
                                    <Switch checked={newFlagValue} onCheckedChange={setNewFlagValue} />
                                </div>
                            ) : (
                                <Input placeholder="Value" value={newValue} onChange={(e) => setNewValue(e.target.value)} />
                            )}
                        </div>
                        <DialogFooter>
                            <Button onClick={handleCreate} disabled={createMutation.isPending}>
                                Save
                            </Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>
            </div>

            {isLoading ? (
                <p className="text-sm text-muted-foreground">Loading...</p>
            ) : settings?.length === 0 ? (
                <p className="text-sm text-muted-foreground">No settings yet.</p>
            ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                    {settings?.map((s: ShopSettings) => {
                        const isFlag = isFeatureKey(s.key);

                        return (
                            <div key={s.id} className="rounded-lg border bg-card p-4 flex flex-col gap-3">
                                <div className="flex items-start justify-between gap-2">
                                    <span className="font-mono text-xs text-muted-foreground break-all">{s.key}</span>
                                    {editId !== s.id && !isFlag && (
                                        <div className="flex gap-1 shrink-0">
                                            <Button size="icon" variant="ghost" className="h-7 w-7" onClick={() => openEdit(s.id, s.value)}>
                                                <Pencil className="h-3.5 w-3.5" />
                                            </Button>
                                            <Button size="icon" variant="ghost" className="h-7 w-7" onClick={() => handleDelete(s.id)}>
                                                <Trash2 className="h-3.5 w-3.5" />
                                            </Button>
                                        </div>
                                    )}
                                    {isFlag && (
                                        <Button size="icon" variant="ghost" className="h-7 w-7 shrink-0" onClick={() => handleDelete(s.id)}>
                                            <Trash2 className="h-3.5 w-3.5" />
                                        </Button>
                                    )}
                                </div>

                                {isFlag ? (
                                    <div className="flex items-center justify-between">
                                        <span className="text-sm">{toBool(s.value) ? "Enabled" : "Disabled"}</span>
                                        <Switch
                                            checked={toBool(s.value)}
                                            onCheckedChange={(checked) => handleFlagToggle(s.id, checked)}
                                            disabled={updateMutation.isPending}
                                        />
                                    </div>
                                ) : editId === s.id ? (
                                    <div className="flex flex-col gap-2">
                                        <Input
                                            value={editValue}
                                            onChange={(e) => setEditValue(e.target.value)}
                                            onKeyDown={(e) => e.key === "Enter" && handleUpdate()}
                                            autoFocus
                                        />
                                        <div className="flex gap-2 justify-end">
                                            <Button size="icon" variant="ghost" className="h-7 w-7" onClick={() => setEditId(null)}>
                                                <X className="h-3.5 w-3.5" />
                                            </Button>
                                            <Button size="icon" className="h-7 w-7" onClick={handleUpdate} disabled={updateMutation.isPending}>
                                                <Check className="h-3.5 w-3.5" />
                                            </Button>
                                        </div>
                                    </div>
                                ) : (
                                    <p className="text-sm break-words">{s.value ?? "—"}</p>
                                )}
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
    );
}
