import React from "react";
import { UseHitsProps, useHits, useSearchBox } from "react-instantsearch-hooks-web";

import { ProductHit } from "../hit";
import ShowAll from "../show-all";

import { cn } from "@/lib/util/cn";

type HitsProps<THit> = React.ComponentProps<"div"> &
    UseHitsProps & {
        hitComponent: (props: { hit: THit }) => JSX.Element;
    };

const Hits = ({ hitComponent: Hit, className, ...props }: HitsProps<ProductHit>) => {
    const { query } = useSearchBox();
    const { hits } = useHits(props);

    return (
        <div
            className={cn("transition-[height,max-height,opacity] duration-300 ease-in-out w-full h-full mb-1 p-4", className, {
                "max-h-full opacity-100": !!query,
                "max-h-0 opacity-0": !query && !hits.length,
            })}
        >
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-4" data-testid="search-results">
                {hits.slice(0, 6).map((hit, index) => (
                    <div
                        key={index}
                        className={cn("", {
                            "hidden sm:block": index > 2,
                        })}
                    >
                        <Hit hit={hit as unknown as ProductHit} />
                    </div>
                ))}
            </div>
            <ShowAll />
        </div>
    );
};

export default Hits;
