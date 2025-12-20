import { useEffect, useState } from "react";

interface MaintenanceProgressProps {
    startDate: Date;
    endDate: Date;
}

const MaintenanceProgress = ({ startDate, endDate }: MaintenanceProgressProps) => {
    const [progress, setProgress] = useState(0);

    useEffect(() => {
        const calculateProgress = () => {
            const now = new Date().getTime();
            const start = startDate.getTime();
            const end = endDate.getTime();

            const totalDuration = end - start;
            const elapsed = now - start;

            const percentage = Math.min(Math.max((elapsed / totalDuration) * 100, 0), 100);
            return percentage;
        };

        setProgress(calculateProgress());

        const timer = setInterval(() => {
            setProgress(calculateProgress());
        }, 1000);

        return () => clearInterval(timer);
    }, [startDate, endDate]);

    return (
        <div className="w-full max-w-md space-y-3">
            <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Maintenance Progress</span>
                <span className="font-semibold text-foreground">{Math.round(progress)}%</span>
            </div>

            <div className="relative h-3 w-full overflow-hidden rounded-full bg-secondary">
                <div
                    className="absolute inset-0 opacity-30"
                    style={{
                        backgroundImage: `repeating-linear-gradient(
              -45deg,
              transparent,
              transparent 8px,
              hsl(var(--contrast) / 0.3) 8px,
              hsl(var(--contrast) / 0.3) 16px
            )`,
                        backgroundSize: "200% 100%",
                        animation: "stripes 20s linear infinite",
                    }}
                />
                <div
                    className="h-full rounded-full bg-contrast transition-all duration-1000 ease-out relative overflow-hidden"
                    style={{ width: `${progress}%` }}
                >
                    <div
                        className="absolute inset-0 opacity-50"
                        style={{
                            background: "linear-gradient(90deg, transparent, rgba(255,255,255,0.4) 50%, transparent)",
                            animation: "shine 2s ease-in-out infinite",
                        }}
                    />
                </div>
            </div>

            <p className="text-xs text-muted-foreground text-center">
                {progress < 100 ? "Our team is working hard to get everything ready for you" : "Almost done! Finishing up final checks..."}
            </p>

            <style>{`
        @keyframes stripes {
          0% { background-position: 0 0; }
          100% { background-position: 50px 0; }
        }
        @keyframes shine {
          0% { transform: translateX(-100%); }
          100% { transform: translateX(100%); }
        }
      `}</style>
        </div>
    );
};

export default MaintenanceProgress;
