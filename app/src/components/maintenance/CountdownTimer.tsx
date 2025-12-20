import { useEffect, useState } from "react";

interface CountdownTimerProps {
    targetDate: Date;
}

interface TimeLeft {
    hours: number;
    minutes: number;
    seconds: number;
    total: number;
}

const CountdownTimer = ({ targetDate }: CountdownTimerProps) => {
    const [timeLeft, setTimeLeft] = useState<TimeLeft>({ hours: 0, minutes: 0, seconds: 0, total: 0 });

    useEffect(() => {
        const calculateTimeLeft = (): TimeLeft => {
            const difference = targetDate.getTime() - new Date().getTime();

            if (difference <= 0) {
                return { hours: 0, minutes: 0, seconds: 0, total: 0 };
            }

            return {
                hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
                minutes: Math.floor((difference / 1000 / 60) % 60),
                seconds: Math.floor((difference / 1000) % 60),
                total: difference,
            };
        };

        setTimeLeft(calculateTimeLeft());

        const timer = setInterval(() => {
            setTimeLeft(calculateTimeLeft());
        }, 1000);

        return () => clearInterval(timer);
    }, [targetDate]);

    const formatNumber = (num: number) => num.toString().padStart(2, "0");

    return (
        <div className="flex items-center justify-center lg:justify-start gap-3 md:gap-4">
            <div className="flex flex-col items-center p-3 md:p-4 rounded-xl bg-card border border-border shadow-soft min-w-[70px] md:min-w-[80px]">
                <span className="text-2xl md:text-3xl font-heading font-bold text-foreground tabular-nums">{formatNumber(timeLeft.hours)}</span>
                <span className="text-xs text-muted-foreground uppercase tracking-wide">Hours</span>
            </div>

            <span className="text-2xl font-bold text-muted-foreground animate-pulse-slow">:</span>

            <div className="flex flex-col items-center p-3 md:p-4 rounded-xl bg-card border border-border shadow-soft min-w-[70px] md:min-w-[80px]">
                <span className="text-2xl md:text-3xl font-heading font-bold text-foreground tabular-nums">{formatNumber(timeLeft.minutes)}</span>
                <span className="text-xs text-muted-foreground uppercase tracking-wide">Minutes</span>
            </div>

            <span className="text-2xl font-bold text-muted-foreground animate-pulse-slow">:</span>

            <div className="flex flex-col items-center p-3 md:p-4 rounded-xl bg-card border border-border shadow-soft min-w-[70px] md:min-w-[80px]">
                <span className="text-2xl md:text-3xl font-heading font-bold text-contrast tabular-nums">{formatNumber(timeLeft.seconds)}</span>
                <span className="text-xs text-muted-foreground uppercase tracking-wide">Seconds</span>
            </div>
        </div>
    );
};

export default CountdownTimer;
