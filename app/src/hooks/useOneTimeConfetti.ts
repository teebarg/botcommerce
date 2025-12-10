import { useEffect } from "react";
import { fireConfetti } from "@/utils/confetti";

export function useOneTimeConfetti(key: string, preset: "big" | "small" | "firework" = "big") {
    useEffect(() => {
        const done = sessionStorage.getItem(`confetti:${key}`);
        if (done) return;

        fireConfetti(preset);
        sessionStorage.setItem(`confetti:${key}`, "1");
    }, [key, preset]);
}
