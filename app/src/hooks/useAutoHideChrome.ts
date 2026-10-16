import { useEffect } from "react";

/**
 * Retracts the site chrome (top bar, filter chips, bottom nav) while the user scrolls down,
 * and brings it back on scroll up. Mount it once on a browsing page (the product feed).
 *
 * It does not move anything itself. It only sets state on <html> that CSS reacts to:
 *   - attribute  data-chrome-hidden   (present while hidden)
 *   - variable   --chrome-visible: 0  (absent while visible; consumers use var(--chrome-visible, 1))
 * so every bar moves on the same signal and desktop can ignore it with `max-md:` variants.
 *
 * Always visible: near the top, near the bottom of the page, and while typing in a field.
 * Everything is restored when the page unmounts, so other routes never inherit a hidden state.
 */
export function useAutoHideChrome({ enabled = true, threshold = 12, topOffset = 80, bottomOffset = 120 } = {}) {
    useEffect(() => {
        if (!enabled) return;

        const root = document.documentElement;
        let lastY = window.scrollY;
        let frame = 0;

        const setHidden = (hidden: boolean) => {
            root.toggleAttribute("data-chrome-hidden", hidden);
            if (hidden) root.style.setProperty("--chrome-visible", "0");
            else root.style.removeProperty("--chrome-visible");
        };

        const update = () => {
            frame = 0;
            const maxY = Math.max(document.documentElement.scrollHeight - window.innerHeight, 0);
            // Clamp both ends: iOS rubber-banding reports values outside 0..maxY and would fake a direction change
            const y = Math.min(Math.max(window.scrollY, 0), maxY);

            const active = document.activeElement;
            const typing = active instanceof HTMLElement && active.matches("input, textarea, select, [contenteditable='true']");

            if (typing || y < topOffset || maxY - y < bottomOffset) {
                setHidden(false);
                lastY = y;
                return;
            }

            const delta = y - lastY;
            // Small moves are not counted and lastY is not updated, so they add up until they pass the threshold
            if (Math.abs(delta) < threshold) return;

            setHidden(delta > 0);
            lastY = y;
        };

        const onScroll = () => {
            if (!frame) frame = requestAnimationFrame(update);
        };

        window.addEventListener("scroll", onScroll, { passive: true });
        return () => {
            window.removeEventListener("scroll", onScroll);
            if (frame) cancelAnimationFrame(frame);
            setHidden(false);
        };
    }, [enabled, threshold, topOffset, bottomOffset]);
}
