import { XMarkMini } from "nui-react-icons";
import { FormEvent } from "react";

import SearchBoxWrapper, { ControlledSearchBoxProps } from "../search-box-wrapper";

const ControlledSearchBox = ({ inputRef, onChange, onReset, onSubmit, placeholder, value, ...props }: ControlledSearchBoxProps) => {
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

        onReset(event);

        if (inputRef.current) {
            inputRef.current.focus();
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
                        autoComplete="off"
                        autoCorrect="off"
                        className="w-full px-2 h-14 font-sans text-lg outline-none rounded-none bg-transparent text-default-900 placeholder-default-500"
                        data-testid="search-input"
                        placeholder={placeholder}
                        role="combobox"
                        spellCheck="false"
                        type="search"
                        value={value}
                        onChange={onChange}
                    />
                    {value && (
                        <button
                            className="relative inline-flex items-center justify-center box-border appearance-none select-none whitespace-nowrap font-normal subpixel-antialiased overflow-hidden outline-none text-tiny rounded-full px-0 gap-0 transition-transform-colors-opacity motion-reduce:transition-none bg-transparent text-foreground min-w-8 w-8 h-8 data-[hover=true]:opacity-hover border data-[hover=true]:bg-content2 border-default-500 dark:border-default-100"
                            type="button"
                            onClick={handleReset}
                        >
                            <XMarkMini />
                        </button>
                    )}
                </div>
            </form>
        </div>
    );
};

const SearchInput = () => {
    return (
        <SearchBoxWrapper>
            {(props) => {
                return <ControlledSearchBox {...props} />;
            }}
        </SearchBoxWrapper>
    );
};

export default SearchInput;
