import { Spinner, Trash } from "nui-react-icons";
import { useState } from "react";
import { deleteLineItem } from "@modules/cart/actions";
import { useSnackbar } from "notistack";

import { cn } from "@/lib/util/cn";

const DeleteButton = ({ id, children, className }: { id: string; children?: React.ReactNode; className?: string }) => {
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
        <div className={cn("flex items-center justify-between text-sm", className)}>
            <button className="flex gap-x-1 text-red-500 hover:text-default-900 cursor-pointer" onClick={() => handleDelete(id)}>
                {isDeleting ? <Spinner className="animate-spin" /> : <Trash />}
                <span>{children}</span>
            </button>
        </div>
    );
};

export default DeleteButton;
