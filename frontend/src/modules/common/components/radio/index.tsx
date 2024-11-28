const Radio = ({ checked, "data-testid": dataTestId }: { checked: boolean; "data-testid"?: string }) => {
    return (
        <>
            <button
                aria-checked="true"
                className="group relative flex h-5 w-5 items-center justify-center outline-none"
                data-state={checked ? "checked" : "unchecked"}
                data-testid={dataTestId || "radio-button"}
                role="radio"
                type="button"
            >
                <div className="group-data-[state=checked]:bg-blue-400 group-data-[state=checked]:shadow-orange-600 group-focus:!shadow-borders-interactive-with-focus group-disabled:!bg-gray-400 group-disabled:!shadow-borders-base flex h-[14px] w-[14px] items-center justify-center rounded-full transition-all">
                    {checked && (
                        <span className="group flex items-center justify-center" data-state={checked ? "checked" : "unchecked"}>
                            <div className="bg-default-900 shadow-md group-disabled:bg-gray-400 rounded-full group-disabled:shadow-none h-1.5 w-1.5" />
                        </span>
                    )}
                </div>
            </button>
        </>
    );
};

export default Radio;
