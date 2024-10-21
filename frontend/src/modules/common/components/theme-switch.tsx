"use client";

import { FC } from "react";
import { VisuallyHidden } from "@react-aria/visually-hidden";
import { useTheme } from "next-themes";
import { useIsSSR } from "@react-aria/ssr";
import { SunFilledIcon, MoonFilledIcon } from "nui-react-icons";
import React from "react";
import { useToggleState } from "@react-stately/toggle";
import { AriaSwitchProps, useSwitch } from "react-aria";

export const ThemeSwitch: FC<AriaSwitchProps> = (props) => {
    const { theme, setTheme } = useTheme();
    const isSSR = useIsSSR();

    const onChange = () => {
        theme === "light" ? setTheme("dark") : setTheme("light");
    };

    const state = useToggleState({
        ...props,
        isSelected: theme === "light" || isSSR,
    });
    const ref = React.useRef<HTMLInputElement>(null);
    const { inputProps } = useSwitch(props, state, ref);

    return (
        <span>
            <VisuallyHidden>
                <input {...inputProps} ref={ref} onChange={onChange} />
            </VisuallyHidden>
            <div onClick={onChange} className="cursor-pointer">
                {!state.isSelected || isSSR ? <SunFilledIcon size={30} /> : <MoonFilledIcon size={30} />}
            </div>
        </span>
    );
};
