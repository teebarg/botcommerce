import { useCallback } from "react";
import { useNavigate, useSearch } from "@tanstack/react-router";

export type FeedView = "list" | "grid";
type FeedSearch = { view?: FeedView };

interface UseFeedUiOptions {
    defaultView?: FeedView;
}

export function useFeedUi(options: UseFeedUiOptions = {}) {
    const { defaultView = "grid" } = options;
    const search = useSearch({ strict: false }) as FeedSearch;
    const navigate = useNavigate();
    const view: FeedView = search.view ?? defaultView;

    const update = useCallback((patch: Partial<FeedSearch>) => {
        navigate({
            to: ".",
            search: ((prev: Record<string, unknown>) => ({ ...prev, ...patch })) as never,
            replace: true,
            resetScroll: false,
        });
    }, [navigate]);

    return { view, setView: (nextView: FeedView) => update({ view: nextView }) };
}
