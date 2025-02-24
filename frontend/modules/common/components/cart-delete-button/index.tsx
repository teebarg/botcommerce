import { Trash } from "nui-react-icons";
import { useState } from "react";
import { useSnackbar } from "notistack";

import { cn } from "@/lib/util/cn";
import { Button } from "@/components/ui/button";
import { api } from "@/api";

const CartDeleteButton = ({ id, children, className }: { id: string; children?: React.ReactNode; className?: string }) => {
    const { enqueueSnackbar } = useSnackbar();
    const [isDeleting, setIsDeleting] = useState<boolean>(false);

    const handleDelete = async (id: string) => {
        setIsDeleting(true);
        try {
            await api.cart.delete(id);
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
