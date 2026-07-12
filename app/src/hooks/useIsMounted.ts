import { useEffect, useState } from "react";

/**
 * True only after client-side hydration completes. False during SSR and
 * during the initial client render (which must match SSR output to avoid
 * a hydration mismatch) — flips to true on the next tick after mount.
 */
export function useIsMounted(): boolean {
    const [mounted, setMounted] = useState(false);
    useEffect(() => {
        setMounted(true);
    }, []);
    return mounted;
}