import { Mail } from "lucide-react";
import { useOverlayTriggerState } from "react-stately";

import { Button } from "@/components/ui/button";
import { useSendCartReminder } from "@/hooks/useAbandonedCart";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";

interface ReminderButtonProps {
    id: number;
}

export const ReminderButton = ({ id }: ReminderButtonProps) => {
    const state = useOverlayTriggerState({});
    const sendReminderMutation = useSendCartReminder();

    const handleSendReminder = () => {
        sendReminderMutation.mutateAsync(id).then(() => {
            state.close();
        });
    };

    return (
        <Dialog open={state.isOpen} onOpenChange={state.setOpen}>
            <DialogTrigger asChild>
                <Button disabled={sendReminderMutation.isPending}>
                    <Mail className="h-4 w-4" />
                    Send Reminder
                </Button>
            </DialogTrigger>
            <DialogContent>
                <DialogHeader className="sr-only">
                    <DialogTitle>Send Reminder</DialogTitle>
                </DialogHeader>
                <div>
                    <div className="pb-2 border-b border-input">
                        <h2 className="text-lg font-semibold leading-6 font-outfit">Send Reminder</h2>
                    </div>
                    <p className="text-sm text-muted-foreground mt-4 font-medium">Are you sure you want to send a reminder to this cart?</p>
                    <div className="flex justify-end gap-2 mt-8">
                        <Button aria-label="submit" className="min-w-36" variant="destructive" onClick={state.close}>
                            Close
                        </Button>
                        <Button
                            aria-label="submit"
                            className="min-w-36"
                            isLoading={sendReminderMutation.isPending}
                            onClick={() => handleSendReminder()}
                        >
                            Send
                        </Button>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
};
