import type React from "react";
import { useOverlayTriggerState } from "react-stately";
import { Button } from "@/components/ui/button";
import SheetDrawer from "@/components/sheet-drawer";
import { useState } from "react";
import { Radio, Send } from "lucide-react";
import { toast } from "sonner";
import { MobilePreview } from "./mobile-preview";
import { useSendPushNotification } from "@/hooks/useApi";
import { ConfirmDrawer } from "@/components/generic/confirm-drawer";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

const TITLE_LIMIT = 65;
const BODY_LIMIT = 180;

interface Props {
    image: string;
}

const GalleryCampaign: React.FC<Props> = ({ image }) => {
    const state = useOverlayTriggerState({});
    const confirmState = useOverlayTriggerState({});
    const [title, setTitle] = useState<string>("");
    const [body, setBody] = useState<string>("");
    const [destination, setDestination] = useState<string>("/collections");
    const { mutateAsync: sendPushNotification, isPending: isSending } = useSendPushNotification();

    const handleDispatch = () => {
        if (!title.trim()) {
            toast.error("Add a headline before dispatching.");
            return;
        }

        sendPushNotification({
            notificationId: crypto.randomUUID(),
            title,
            body,
            image,
            path: destination,
        }).then(() => {
            state.setOpen(false);
        });
    };

    return (
        <SheetDrawer
            open={state.isOpen}
            title={
                <header>
                    <h1>Curate Dispatch</h1>
                    <p className="text-muted-foreground mt-1 max-w-md text-sm">Configure the messaging and targeting for your next campaign.</p>
                </header>
            }
            trigger={
                <div className="p-2 bg-amber-500">
                    <Radio className="h-5 w-5 text-white" />
                </div>
            }
            onOpenChange={state.setOpen}
        >
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-20 flex-1 overflow-auto px-2.5 py-4">
                <div className="lg:col-span-7 flex flex-col gap-12">
                    <div>
                        <div className="flex justify-between items-end mb-2 text-[11px]">
                            <Label>Headline</Label>
                            <span className="text-muted-foreground tabular-nums">
                                {title.length} / {TITLE_LIMIT}
                            </span>
                        </div>
                        <Input
                            value={title}
                            maxLength={TITLE_LIMIT}
                            onChange={(e) => setTitle(e.target.value)}
                            placeholder="e.g., The Autumn Cashmere"
                        />
                    </div>

                    <div>
                        <div className="flex justify-between items-end mb-2 text-[11px]">
                            <Label>Narrative</Label>
                            <span className="text-muted-foreground tabular-nums">
                                {body.length} / {BODY_LIMIT}
                            </span>
                        </div>
                        <Textarea
                            value={body}
                            maxLength={BODY_LIMIT}
                            onChange={(e) => setBody(e.target.value)}
                            placeholder="Write a short, evocative message…"
                            className="max-h-28"
                        />
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-10">
                        <div className="relative w-full aspect-video rounded-xl overflow-hidden border border-border group">
                            <img src={image} alt={image ?? "Selected visual asset"} className="w-full h-full object-cover" />
                        </div>
                        <div>
                            <Label>Destination URL</Label>
                            <Input value={destination} onChange={(e) => setDestination(e.target.value)} placeholder="/…" />
                        </div>
                    </div>

                    <ConfirmDrawer
                        open={confirmState.isOpen}
                        onOpenChange={confirmState.setOpen}
                        trigger={
                            <Button className="w-full" variant="default">
                                <Send className="size-4" />
                                Dispatch Now
                            </Button>
                        }
                        onClose={confirmState.close}
                        onConfirm={handleDispatch}
                        title="Confirm Dispatch"
                        description="Are you sure you want to dispatch this campaign?"
                        isLoading={isSending}
                        variant="default"
                        confirmText="Send"
                    />
                </div>

                <aside className="lg:col-span-5">
                    <div className="lg:sticky lg:top-12 flex flex-col items-center">
                        <MobilePreview title={title} body={body} imageUrl={image ?? undefined} />
                        <p className="text-xs text-muted-foreground mt-6 text-center max-w-[280px] leading-relaxed">
                            Live preview reflects what your users will see on their device.
                        </p>
                    </div>
                </aside>
            </div>
        </SheetDrawer>
    );
};

export { GalleryCampaign };
