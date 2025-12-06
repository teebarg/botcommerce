"use client";

import { ReactNode, createContext, useContext, useEffect, useRef, useState } from "react";

const ProgressBarContext = createContext<ReturnType<typeof useProgress> | null>(null);

export function useProgressBar() {
    let progress = useContext(ProgressBarContext);

    if (progress === null) {
        throw new Error("Need to be inside provider");
    }

    return progress;
}

export function ProgressBar({ className, children }: { className: string; children: ReactNode }) {
    let progress = useProgress();
    const width = `${progress.value}%`;

    return (
        <ProgressBarContext.Provider value={progress}>
            {progress.state !== "complete" && (
                <div
                    className={className}
                    style={{
                        width,
                        transition: "width 0.2s ease-out, opacity 0.2s ease-out",
                        opacity: progress.state === "completing" ? 0 : 1,
                        zIndex: 1000,
                        position: "fixed",
                    }}
                />
            )}

            {children}
        </ProgressBarContext.Provider>
    );
}

function useProgress() {
    const [state, setState] = useState<"initial" | "in-progress" | "completing" | "complete">("initial");
    const [value, setValue] = useState(0);

    useInterval(
        () => {
            if (value === 100) {
                setValue(0);

                return;
            }

            let diff;

            if (value === 0) {
                diff = 15;
            } else if (value < 50) {
                diff = rand(1, 10);
            } else {
                diff = rand(1, 5);
            }
            setValue((prev) => Math.min(prev + diff, 99));
        },
        state === "in-progress" ? 750 : null
    );

    function reset() {
        setState("initial");
    }

    function start() {
        setState("in-progress");
    }

    function done() {
        setState((state) => (state === "initial" || state === "in-progress" ? "completing" : state));
    }

    return { state, value, start, done, reset };
}

function rand(min: number, max: number) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

function useInterval(callback: () => void, delay: number | null) {
    const savedCallback = useRef(callback);

    useEffect(() => {
        savedCallback.current = callback;
    }, [callback]);

    useEffect(() => {
        if (delay !== null) {
            savedCallback.current();
            const id = setInterval(savedCallback.current, delay);

            return () => clearInterval(id);
        }
    }, [delay]);
}

export default ProgressBar;
