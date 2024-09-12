import { Disclosure } from "@headlessui/react";
import { useEffect } from "react";
import useToggleState from "@lib/hooks/use-toggle-state";
import { useFormStatus } from "react-dom";
import { useSnackbar } from "notistack";
import clsx from "clsx";
import Button from "@modules/common/components/button";

type AccountInfoProps = {
    label: string;
    currentInfo: string | React.ReactNode;
    isSuccess?: boolean;
    isError?: boolean;
    errorMessage?: string;
    clearState: () => void;
    children?: React.ReactNode;
    "data-testid"?: string;
};

const AccountInfo = ({
    label,
    currentInfo,
    isSuccess,
    isError,
    clearState,
    errorMessage = "An error occurred, please try again",
    children,
    "data-testid": dataTestid,
}: AccountInfoProps) => {
    const { enqueueSnackbar } = useSnackbar();
    const { state, close, toggle } = useToggleState();

    const { pending } = useFormStatus();

    const handleToggle = () => {
        clearState();
        setTimeout(() => toggle(), 100);
    };

    useEffect(() => {
        if (isSuccess) {
            enqueueSnackbar(`${label} updated succesfully`, { variant: "success" });
            close();

            return;
        }
        if (isError) {
            enqueueSnackbar(errorMessage, { variant: "error" });
        }
    }, [isSuccess, isError]);

    return (
        <div className="text-sm" data-testid={dataTestid}>
            <div className="flex items-end justify-between">
                <div className="flex flex-col">
                    <span className="uppercase">{label}</span>
                    <div className="flex items-center flex-1 basis-0 justify-end gap-x-4">
                        {typeof currentInfo === "string" ? (
                            <span className="font-semibold" data-testid="current-info">
                                {currentInfo}
                            </span>
                        ) : (
                            currentInfo
                        )}
                    </div>
                </div>
                <div>
                    <Button
                        className="w-[100px] min-h-[25px] py-1"
                        color="default"
                        data-testid="edit-button"
                        type={state ? "reset" : "button"}
                        variant="bordered"
                        onClick={handleToggle}
                    >
                        {state ? "Cancel" : "Edit"}
                    </Button>
                </div>
            </div>

            <Disclosure>
                <Disclosure.Panel
                    static
                    className={clsx("transition-[max-height,opacity] duration-300 ease-in-out overflow-visible", {
                        "max-h-[1000px] opacity-100": state,
                        "max-h-0 opacity-0": !state,
                    })}
                >
                    <div className="flex flex-col gap-y-2 py-4">
                        <div>{children}</div>
                        <div className="flex items-center justify-end mt-2">
                            <Button className="w-full sm:max-w-[140px]" data-testid="save-button" isLoading={pending} type="submit">
                                Save changes
                            </Button>
                        </div>
                    </div>
                </Disclosure.Panel>
            </Disclosure>
        </div>
    );
};

export default AccountInfo;
