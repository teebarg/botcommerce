import confetti from "canvas-confetti";

export function fireConfetti(preset: "big" | "small" | "firework" = "big") {
    if (preset === "big") {
        confetti({
            particleCount: 200,
            spread: 90,
            origin: { y: 0.6 },
        });
    }

    if (preset === "small") {
        confetti({
            particleCount: 80,
            spread: 60,
            origin: { y: 0.7 },
        });
    }

    if (preset == "firework") {
        var duration = 15 * 1000;
        var animationEnd = Date.now() + duration;
        var defaults = { startVelocity: 30, spread: 360, ticks: 60, zIndex: 0 };

        function randomInRange(min: number, max: number) {
            return Math.random() * (max - min) + min;
        }

        var interval = setInterval(function () {
            var timeLeft = animationEnd - Date.now();

            if (timeLeft <= 0) {
                return clearInterval(interval);
            }

            var particleCount = 50 * (timeLeft / duration);
            confetti({ ...defaults, particleCount, origin: { x: randomInRange(0.1, 0.3), y: Math.random() - 0.2 } });
            confetti({ ...defaults, particleCount, origin: { x: randomInRange(0.7, 0.9), y: Math.random() - 0.2 } });
        }, 250);
    }
}
