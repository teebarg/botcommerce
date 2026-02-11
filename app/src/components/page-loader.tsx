import { useEffect, useState } from "react";

function PageLoader() {
    const [loadingPhase, setLoadingPhase] = useState(0);

    useEffect(() => {
        // Phase progression
        const phaseInterval = setInterval(() => {
            setLoadingPhase((prev) => (prev + 1) % 3);
        }, 2000);

        return () => clearInterval(phaseInterval);
    }, []);

    return (
        <div className="flex-1 w-full max-w-7xl mx-auto">
            <div className="relative z-10 flex items-center justify-center h-full">
                <div className="text-center px-4">
                    {/* Morphing shape loader */}
                    <div className="relative w-32 h-32 mx-auto mb-12">
                        {/* Middle rotating hexagon-like shape */}
                        <div className="absolute inset-4 border-2 border-border animate-rotateMorphReverse" style={{ borderRadius: "30%" }}></div>
                        <div className="absolute inset-8 bg-secondary rounded-full animate-pulse-scale" />

                        {/* Center dot with trail effect */}
                        <div className="absolute inset-0 flex items-center justify-center">
                            <div className="relative">
                                {/* Trail dots */}
                                {[0, 1, 2].map((i) => (
                                    <div
                                        key={i}
                                        className="absolute bg-foreground w-2 h-2 rounded-full animate-orbit"
                                        style={{
                                            animation: `orbit ${2 + i * 0.3}s infinite linear`,
                                            animationDelay: `${i * 0.2}s`,
                                            opacity: 1 - i * 0.3,
                                        }}
                                    ></div>
                                ))}
                                <div className="w-3 h-3 bg-foreground rounded-full shadow-lg"></div>
                            </div>
                        </div>

                        {/* Expanding rings */}
                        {[0, 1, 2].map((i) => (
                            <div
                                key={i}
                                className="absolute inset-0 border border-black/10 rounded-full animate-expandFade"
                                style={{ animationDelay: `${i * 0.6}s` }}
                            ></div>
                        ))}
                    </div>

                    {/* Dynamic text content */}
                    <div className="space-y-4">
                        <div className="relative h-8 overflow-hidden">
                            <div
                                className="absolute inset-0 flex flex-col items-center transition-transform duration-500"
                                style={{ transform: `translateY(-${loadingPhase * 100}%)` }}
                            >
                                <h2 className="text-2xl font-bold h-8 flex items-center">Curating</h2>
                                <h2 className="text-2xl font-bold h-8 flex items-center">Crafting</h2>
                                <h2 className="text-2xl font-bold h-8 flex items-center">Creating</h2>
                            </div>
                        </div>

                        <p className="text-sm text-muted-foreground animate-fadeInOut">
                            {loadingPhase === 0 && "Your experience"}
                            {loadingPhase === 1 && "Something special"}
                            {loadingPhase === 2 && "Just for you"}
                        </p>
                    </div>

                    {/* Animated progress indicator */}
                    <div className="mt-10 flex items-center justify-center gap-2">
                        {[0, 1, 2, 3, 4].map((i) => (
                            <div
                                key={i}
                                className="w-1.5 h-1.5 bg-foreground rounded-full animate-wave"
                                style={{ animationDelay: `${i * 0.15}s` }}
                            ></div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}

export default PageLoader;
