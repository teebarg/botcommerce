import React from "react";
import { AriaProgressBarProps, useProgressBar } from "@react-aria/progress";

interface ProgressBarProps extends AriaProgressBarProps {
    label?: string;
    showValueLabel?: boolean;
    value: number;
    minValue?: number;
    maxValue?: number;
}

const ProgressBar: React.FC<ProgressBarProps> = (props) => {
    let { label, showValueLabel = !!label, value, minValue = 0, maxValue = 100 } = props;
    let { progressBarProps, labelProps } = useProgressBar(props);

    // Calculate the width of the progress bar as a percentage
    let percentage = (value - minValue) / (maxValue - minValue);
    let barWidth = `${Math.round(percentage * 100)}%`;

    return (
        <React.Fragment>
            <div {...progressBarProps} className="text-sm">
                <div className="flex justify-between">
                    {label && <span {...labelProps}>{label}</span>}
                    {showValueLabel && <span>{progressBarProps["aria-valuetext"]}</span>}
                </div>
                <div className="h-1 rounded-full overflow-hidden" style={{ background: "lightgray" }}>
                    <div className="h-1" style={{ width: barWidth, background: "orange" }} />
                </div>
            </div>
        </React.Fragment>
    );
};

export { ProgressBar };
