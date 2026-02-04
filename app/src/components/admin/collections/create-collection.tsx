import type React from "react";
import { useOverlayTriggerState } from "react-stately";
import { Button } from "@/components/ui/button";
import { CollectionForm } from "@/components/admin/collections/collection-form";
import SheetDrawer from "@/components/sheet-drawer";

type Props = {};

const CreateCollection: React.FC<Props> = () => {
    const state = useOverlayTriggerState({});

    return (
        <SheetDrawer
            open={state.isOpen}
            title="Create Collection"
            trigger={<Button onClick={state.open}>Create Collection</Button>}
            onOpenChange={state.setOpen}
        >
            <CollectionForm type="create" onClose={state.close} />
        </SheetDrawer>
    );
};

export { CreateCollection };
