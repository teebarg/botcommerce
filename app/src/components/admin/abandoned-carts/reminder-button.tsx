import { Mail } from "lucide-react";
import { useOverlayTriggerState } from "react-stately";
import { Button } from "@/components/ui/button";
import { useSendCartReminder } from "@/hooks/useAbandonedCart";
import { ConfirmDrawer } from "@/components/generic/confirm-drawer";

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
        <ConfirmDrawer
            open={state.isOpen}
            onOpenChange={state.setOpen}
            trigger={
                <Button disabled={sendReminderMutation.isPending}>
                    <Mail className="h-4 w-4" />
                    Send Reminder
                </Button>
            }
            onClose={state.close}
            onConfirm={handleSendReminder}
            title="Send Reminder"
            confirmText="Send"
            isLoading={sendReminderMutation.isPending}
            variant="default"
        />
    );
};
