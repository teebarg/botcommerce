import { useEffect, useState } from "react";

/**
 * True while the user is scrolling up (or near the top of the page); false while scrolling down.
 * Use it for floating controls that should stay out of the way while browsing.
 *
 * - `threshold`: px of travel before a direction change counts, so small jitters are ignored
 * - `topOffset`: always visible while within this many px of the top
 */
export function useShowOnScrollUp({ threshold = 12, topOffset = 80 } = {}) {
    const [visible, setVisible] = useState(true);

    useEffect(() => {
        let lastY = window.scrollY;
        let frame = 0;

        const update = () => {
            frame = 0;
            // Clamp: iOS rubber-banding reports negative values at the top
            const y = Math.max(window.scrollY, 0);

            if (y < topOffset) {
                setVisible(true);
                lastY = y;
                return;
            }

            const delta = y - lastY;
            // Small moves aren't counted and lastY isn't updated, so they add up until they pass the threshold
            if (Math.abs(delta) < threshold) return;

            setVisible(delta < 0);
            lastY = y;
        };

        const onScroll = () => {
            if (!frame) frame = requestAnimationFrame(update);
        };

        window.addEventListener("scroll", onScroll, { passive: true });
        return () => {
            window.removeEventListener("scroll", onScroll);
            if (frame) cancelAnimationFrame(frame);
        };
    }, [threshold, topOffset]);

    return visible;
}
