import { Trash } from "nui-react-icons";
import { useState } from "react";
import { deleteLineItem } from "@modules/cart/actions";
import { useSnackbar } from "notistack";

import { cn } from "@/lib/util/cn";
import { Button } from "@/components/ui/button";

const CartDeleteButton = ({ id, children, className }: { id: string; children?: React.ReactNode; className?: string }) => {
    const { enqueueSnackbar } = useSnackbar();
    const [isDeleting, setIsDeleting] = useState<boolean>(false);

    const handleDelete = async (id: string) => {
        setIsDeleting(true);
        try {
            await deleteLineItem(id);
        } catch (error) {
            enqueueSnackbar(`Error deleting item: ${error}`, { variant: "error" });
        } finally {
            setIsDeleting(false);
        }
    };

    return (
        <div className={cn("text-sm", className)}>
            <Button aria-label="delete" isLoading={isDeleting} startContent={<Trash />} onClick={() => handleDelete(id)}>
                {children}
            </Button>
        </div>
    );
};

export default CartDeleteButton;
