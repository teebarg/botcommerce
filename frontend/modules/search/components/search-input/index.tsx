import { Button } from "@/components/ui/button";
import { XMarkMini } from "nui-react-icons";
import { ChangeEvent, FormEvent, useRef } from "react";

interface ControlledSearchBoxProps {
    onChange(event: ChangeEvent): void;
    onReset?(event: FormEvent): void;
    onSubmit?(event: FormEvent): void;
    placeholder?: string;
    value?: string;
}

const SearchInput = ({ onChange, onReset, onSubmit, placeholder, value, ...props }: ControlledSearchBoxProps) => {
    const inputRef = useRef<HTMLInputElement>(null);
    const handleSubmit = (event: FormEvent) => {
        event.preventDefault();
        event.stopPropagation();

        if (onSubmit) {
            onSubmit(event);
        }

        if (inputRef.current) {
            inputRef.current.blur();
        }
    };

    const handleReset = (event: FormEvent) => {
        event.preventDefault();
        event.stopPropagation();

        onReset?.(event);

        if (inputRef.current) {
            inputRef.current.focus();
            inputRef.current.value = "";
        }
    };

    return (
        <div {...props} className="w-full">
            <form noValidate action="" onReset={handleReset} onSubmit={handleSubmit}>
                <div className="flex items-center justify-between">
                    <input
                        ref={inputRef}
                        aria-autocomplete="list"
                        aria-controls="list"
                        aria-expanded="true"
                        aria-label="click"
                        autoComplete="off"
                        autoCorrect="off"
                        className="w-full px-2 py-2 text-lg focus-visible:outline-none bg-transparent text-default-900 placeholder-default-500"
                        data-testid="search-input"
                        placeholder={placeholder}
                        role="combobox"
                        spellCheck="false"
                        type="search"
                        value={value}
                        onChange={onChange}
                    />
                    {value && (
                        <Button aria-label="reset" onClick={handleReset} size="icon" variant="ghost">
                            <XMarkMini />
                        </Button>
                    )}
                </div>
            </form>
        </div>
    );
};

export default SearchInput;
