import type { ReactNode } from "react";
import { useIsMounted } from "@/hooks/useIsMounted";

interface ClientOnlyProps {
    children: ReactNode;
    /** Rendered during SSR and the pre-hydration client pass. Keep this
     * neutral/generic — it's what gets baked into any cached document. */
    fallback?: ReactNode;
}

/**
 * Delays rendering children until after hydration. Use for any subtree
 * that reads per-user state (auth, wishlist, cart, roles) on a route
 * whose document might be CDN-cached.
 */
export function ClientOnly({ children, fallback = null }: ClientOnlyProps) {
    const mounted = useIsMounted();
    return mounted ? <>{children}</> : <>{fallback}</>;
}