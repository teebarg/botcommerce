"use client";

import React, { useState, useEffect } from "react";
import { Cart, Clock, Tag } from "nui-react-icons";

import { BtnLink } from "@/components/ui/btnLink";

interface TimeLeft {
    hours: number;
    minutes: number;
    seconds: number;
}

const FlashBanner: React.FC = () => {
    const [timeLeft, setTimeLeft] = useState<TimeLeft>({ hours: 0, minutes: 0, seconds: 0 });
    const [hydrated, setHydrated] = useState(false);

    function calculateTimeLeft(targetDate: Date): TimeLeft {
        const now = new Date();
        const difference = targetDate.getTime() - now.getTime();

        if (difference <= 0) {
            return { hours: 0, minutes: 0, seconds: 0 };
        }

        return {
            hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
            minutes: Math.floor((difference / (1000 * 60)) % 60),
            seconds: Math.floor((difference / 1000) % 60),
        };
    }

    useEffect(() => {
        // Indicate hydration
        setHydrated(true);

        // Store the end time in localStorage to persist across page reloads
        const storedEndTime = localStorage.getItem("flashSaleEndTime");
        const endTime = storedEndTime
            ? new Date(parseInt(storedEndTime, 10))
            : (() => {
                  const newEndTime = new Date();

                  newEndTime.setHours(newEndTime.getHours() + 24);
                  localStorage.setItem("flashSaleEndTime", newEndTime.getTime().toString());

                  return newEndTime;
              })();

        const timer = setInterval(() => {
            const newTimeLeft = calculateTimeLeft(endTime);

            setTimeLeft(newTimeLeft);

            // Stop the timer when countdown reaches zero
            if (newTimeLeft.hours === 0 && newTimeLeft.minutes === 0 && newTimeLeft.seconds === 0) {
                clearInterval(timer);
                localStorage.removeItem("flashSaleEndTime");
            }
        }, 1000);

        return () => clearInterval(timer);
    }, []);

    if (!hydrated) {
        // Render an empty container or skeleton until hydrated
        return <div className="h-24 bg-gray-800 rounded-2xl shadow-2xl max-w-7xl mx-auto" />;
    }

    return (
        <div className="bg-gradient-to-r from-black/80 to-gray-800 ">
            <div className="text-white px-2 py-4 rounded-2xl shadow-2xl max-w-5xl mx-auto flex items-center justify-between">
                <div className="flex items-center gap-1">
                    <Tag className="w-8 h-8 text-yellow-400" viewBox="0 0 20 20" />
                    <div>
                        <h2 className="text-sm md:text-2xl font-bold text-yellow-300">Flash Sale</h2>
                        <p className="text-sm text-gray-300 hidden md:inline-block">Exclusive 24-Hour Deals</p>
                        <div className="flex md:hidden space-x-1 text-center">
                            {(["hours", "minutes", "seconds"] as const).map((timeUnit, index: number) => (
                                <div key={timeUnit} suppressHydrationWarning>
                                    <span className="text-xs font-semibold">
                                        {timeLeft[timeUnit].toString().padStart(2, "0")}
                                        {timeUnit.charAt(0)}
                                    </span>
                                    {index < 2 && <span>:</span>}
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                <div className="hidden md:flex items-center space-x-4">
                    <Clock className="w-10 h-10 text-yellow-400" />
                    <div className="flex space-x-2 text-center">
                        {(["hours", "minutes", "seconds"] as const).map((timeUnit) => (
                            <div key={timeUnit} suppressHydrationWarning className="bg-white/20 p-2 rounded-lg w-16">
                                <span className="text-2xl font-bold">{timeLeft[timeUnit].toString().padStart(2, "0")}</span>
                                <p className="text-xs">{timeUnit.charAt(0).toUpperCase() + timeUnit.slice(1)}</p>
                            </div>
                        ))}
                    </div>
                </div>

                <BtnLink className="text-black" color="warning" href="/collections">
                    <Cart className="w-5 h-5" />
                    <span>Shop Now</span>
                </BtnLink>
            </div>
        </div>
    );
};

export default FlashBanner;
