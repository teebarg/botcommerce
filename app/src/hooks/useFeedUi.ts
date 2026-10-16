import { useCallback } from "react";
import { useNavigate, useSearch } from "@tanstack/react-router";

export type FeedView = "list" | "grid";
type FeedSearch = { mode?: "quick"; view?: FeedView };

/**
 * Feed UI state lives in the URL, so a link decides the customer's path:
 *   /?mode=quick            -> tap-to-select + "Send to WhatsApp", single column
 *   /?mode=quick&view=grid  -> same, 2 columns on mobile
 *   /                       -> normal storefront, unchanged
 */
export function useFeedUi() {
    const search = useSearch({ strict: false }) as FeedSearch;
    const navigate = useNavigate();

    const quick = search.mode === "quick";
    const view: FeedView = search.view ?? (quick ? "list" : "grid");

    const update = useCallback(
        (patch: Partial<FeedSearch>) => {
            navigate({
                to: ".",
                search: ((prev: Record<string, unknown>) => ({ ...prev, ...patch })) as never,
                replace: true, // toggling a view shouldn't fill the back-button history
                resetScroll: false,
            });
        },
        [navigate]
    );

    return {
        quick,
        view,
        setView: (v: FeedView) => update({ view: v }),
        setQuick: (on: boolean) => update({ mode: on ? "quick" : undefined }),
    };
}
