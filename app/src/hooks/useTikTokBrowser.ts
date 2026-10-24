import { useEffect, useState } from "react";

/**
 * True when the page is open inside TikTok's in-app browser.
 *
 * Add `?inapp=1` to the URL to force it on, for testing on a desktop.
 */
export function useTikTokBrowser() {
    const [inTikTok, setInTikTok] = useState(false);

    useEffect(() => {
        const ua = navigator.userAgent;
        const forced = new URLSearchParams(window.location.search).get("inapp") === "1";
        setInTikTok(forced || /musical_ly|BytedanceWebview|TikTok|trill/i.test(ua));
    }, []);

    return inTikTok;
}
