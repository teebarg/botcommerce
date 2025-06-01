import useToggleState from "@lib/hooks/use-toggle-state";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type AccountInfoProps = {
    label: string;
    currentInfo: string | React.ReactNode;
    isLoading?: boolean;
    clearState: () => void;
    children?: React.ReactNode;
    "data-testid"?: string;
};

const AccountInfo = ({ label, currentInfo, isLoading, clearState, children, "data-testid": dataTestid }: AccountInfoProps) => {
    const { state, toggle } = useToggleState();

    const handleToggle = () => {
        clearState();
        setTimeout(() => toggle(), 100);
    };

    return (
        <div className="text-sm" data-testid={dataTestid}>
            <div className="flex items-start justify-between">
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
                        className="w-[100px] py-1"
                        data-testid="edit-button"
                        type={state ? "reset" : "button"}
                        variant="outline"
                        onClick={handleToggle}
                    >
                        {state ? "Cancel" : "Edit"}
                    </Button>
                </div>
            </div>

            <div
                className={cn(
                    "static transition-[max-height,opacity] duration-300 ease-in-out overflow-visible",
                    state ? "max-h-[1000px] opacity-100" : "max-h-0 opacity-0"
                )}
            >
                <div className="flex flex-col gap-y-2 py-4">
                    <div>{children}</div>
                    <div className="flex items-center justify-end mt-2">
                        <Button aria-label="save" className="w-full sm:max-w-[140px]" data-testid="save-button" isLoading={isLoading} type="submit">
                            Save changes
                        </Button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AccountInfo;
