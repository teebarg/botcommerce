"use client";

import React, { useState, useRef } from "react";

import { cn } from "@/lib/utils";

interface SliderProps {
    label?: string;
    defaultValue?: number[];
    min?: number;
    max?: number;
    step?: number;
    onChange?: (values: number[]) => void;
}

const RangeSlider: React.FC<SliderProps> = ({ label, defaultValue = [0, 1000], min = 0, max = 1000, step = 10, onChange }) => {
    const [values, setValues] = useState(defaultValue);
    const trackRef = useRef<HTMLDivElement>(null);

    const updateValue = (index: number, newValue: number) => {
        setValues((prev) => {
            const updated = [...prev];

            updated[index] = Math.min(Math.max(newValue, min), max);
            if (index === 0 && updated[0] > updated[1]) updated[0] = updated[1];
            if (index === 1 && updated[1] < updated[0]) updated[1] = updated[0];
            onChange?.(updated);

            return updated;
        });
    };

    const handleDrag = (index: number, event: React.MouseEvent | React.TouchEvent) => {
        event.preventDefault();
        const startX = "touches" in event ? event.touches[0].clientX : event.clientX;
        const track = trackRef.current;

        if (!track) return;

        const trackRect = track.getBoundingClientRect();
        const startValue = values[index];

        const handleMove = (moveEvent: MouseEvent | TouchEvent) => {
            const clientX = "touches" in moveEvent ? moveEvent.touches[0].clientX : moveEvent.clientX;
            const ratio = (clientX - trackRect.left) / trackRect.width;
            const newValue = Math.round(min + ratio * (max - min));

            updateValue(index, newValue);
        };

        const handleEnd = () => {
            document.removeEventListener("mousemove", handleMove);
            document.removeEventListener("mouseup", handleEnd);
            document.removeEventListener("touchmove", handleMove);
            document.removeEventListener("touchend", handleEnd);
        };

        document.addEventListener("mousemove", handleMove);
        document.addEventListener("mouseup", handleEnd);
        document.addEventListener("touchmove", handleMove);
        document.addEventListener("touchend", handleEnd);
    };

    return (
        <div className="flex flex-col w-full max-w-md mx-auto mb-4">
            {label && (
                <div className="flex justify-between text-sm mb-2">
                    <label className="text-default-600 font-medium">{label}</label>
                    <output className="text-default-800 font-semibold">
                        ₦{values[0]} - ₦{values[1]}
                    </output>
                </div>
            )}
            <div ref={trackRef} className="relative h-2 bg-gray-200 rounded-full mt-2">
                <div
                    className="absolute bg-indigo-500 h-full rounded-full"
                    style={{
                        left: `${((values[0] - min) / (max - min)) * 100}%`,
                        right: `${100 - ((values[1] - min) / (max - min)) * 100}%`,
                    }}
                />
                {[0, 1].map((index) => (
                    <div
                        key={index}
                        className={cn(
                            "absolute w-6 h-6 bg-white border-2 border-indigo-500 rounded-full shadow-md -top-2 cursor-pointer transition-transform transform hover:scale-110"
                        )}
                        style={{
                            left: `${((values[index] - min) / (max - min)) * 100}%`,
                            transform: "translateX(-50%)",
                        }}
                        tabIndex={0}
                        onMouseDown={(e) => handleDrag(index, e)}
                        onTouchStart={(e) => handleDrag(index, e)}
                    />
                ))}
            </div>
        </div>
    );
};

export default RangeSlider;
