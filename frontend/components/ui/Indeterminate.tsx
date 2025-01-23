import React from "react";

const Indeterminate: React.FC = () => {
    return (
        <React.Fragment>
            <div className="hidden transition-loader h-full w-full z-50 fixed" style={{ height: "auto" }}>
                <div className="flex flex-col gap-2 w-full" aria-label="Loading..." aria-valuemin={0} aria-valuemax={100} role="progressbar">
                    <div className="z-0 relative bg-default-300/50 overflow-hidden h-1 rounded-full">
                        <div
                            className="h-full bg-primary rounded-full absolute w-full origin-left animate-indeterminate-bar transition-transform !duration-500"
                            style={{ transform: "translateX(-100%)" }}
                        />
                    </div>
                </div>
            </div>
        </React.Fragment>
    );
};

export default Indeterminate;
