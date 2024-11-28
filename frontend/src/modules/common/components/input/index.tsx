import React, { useEffect, useImperativeHandle, useState } from "react";
import Eye from "@modules/common/icons/eye";
import EyeOff from "@modules/common/icons/eye-off";

type InputProps = Omit<Omit<React.InputHTMLAttributes<HTMLInputElement>, "size">, "placeholder"> & {
    label: string;
    errors?: Record<string, unknown>;
    touched?: Record<string, unknown>;
    name: string;
    topLabel?: string;
};

const Input = React.forwardRef<HTMLInputElement, InputProps>(({ type, name, label, touched, required, topLabel, ...props }, ref) => {
    const inputRef = React.useRef<HTMLInputElement>(null);
    const [showPassword, setShowPassword] = useState(false);
    const [inputType, setInputType] = useState(type);

    useEffect(() => {
        if (type === "password" && showPassword) {
            setInputType("text");
        }

        if (type === "password" && !showPassword) {
            setInputType("password");
        }
    }, [type, showPassword]);

    useImperativeHandle(ref, () => inputRef.current!);

    return (
        <div className="flex flex-col w-full">
            {topLabel && <label className="mb-2 text-sm font-medium">{topLabel}</label>}
            <div className="flex relative z-0 w-full text-sm font-medium">
                <input
                    className="pt-4 pb-1 block w-full h-11 px-4 mt-0 bg-default border rounded-md appearance-none focus:outline-none focus:ring-0"
                    name={name}
                    placeholder=" "
                    required={required}
                    type={inputType}
                    {...props}
                    ref={inputRef}
                />
                <label
                    className="flex items-center justify-center mx-3 px-1 transition-all absolute duration-300 top-3 -z-1 origin-0 text-default-500"
                    htmlFor={name}
                >
                    {label}
                    {required && <span className="text-rose-500">*</span>}
                </label>
                {type === "password" && (
                    <button
                        className="text-default-500 px-4 focus:outline-none transition-all duration-150 outline-none focus:text-default-900 absolute right-0 top-3"
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                    >
                        {showPassword ? <Eye /> : <EyeOff />}
                    </button>
                )}
            </div>
        </div>
    );
});

Input.displayName = "Input";

export default Input;
