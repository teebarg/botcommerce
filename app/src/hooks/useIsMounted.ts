// hooks/useIsMounted.ts
import { useEffect, useState } from "react";

/**
 * True only after client-side hydration completes. False during SSR and
 * during the initial client render (which must match SSR output to avoid
 * a hydration mismatch) — flips to true on the next tick after mount.
 *
 * Use this to gate any UI that depends on per-user state (auth, wishlist,
 * cart, admin role) so the server-rendered/CDN-cached shell never contains
 * personalized content — safe even if this route's document response
 * later gets CDN-cache headers added.
 */
export function useIsMounted(): boolean {
    const [mounted, setMounted] = useState(false);
    useEffect(() => {
        setMounted(true);
    }, []);
    return mounted;
}