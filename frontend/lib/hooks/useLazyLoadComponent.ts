import { useEffect, useState } from "react";
import { useInView } from "react-intersection-observer";

interface LazyLoadOptions {
    triggerOnce?: boolean;
    rootMargin?: string;
    delay?: number;
}

/**
 * Detects when an element is in view and triggers once (or multiple times).
 * Can be used with Framer Motion or dynamic import to defer work.
 */
export const useLazyLoadComponent = (options?: LazyLoadOptions) => {
    const { triggerOnce = true, rootMargin = "0px", delay = 0 } = options || {};
    const { ref, inView } = useInView({ triggerOnce, rootMargin });

    const [hasEnteredView, setHasEnteredView] = useState(false);

    useEffect(() => {
        if (inView && !hasEnteredView) {
            if (delay > 0) {
                const timeout = setTimeout(() => setHasEnteredView(true), delay);
                return () => clearTimeout(timeout);
            }
            setHasEnteredView(true);
        }
    }, [inView, delay, hasEnteredView]);

    return {
        ref,
        inView,
        hasEnteredView,
    };
};
