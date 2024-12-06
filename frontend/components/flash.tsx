"use client";

import React, { useState, useEffect } from "react";
import { Cart, Tag } from "nui-react-icons";

import LocalizedClientLink from "@/modules/common/components/localized-client-link";

interface TimeLeft {
    hours: number;
    minutes: number;
    seconds: number;
}

const FlashBanner: React.FC = () => {
    const [timeLeft, setTimeLeft] = useState<TimeLeft>(() => {
        // Initialize with 24 hours from now
        const endTime = new Date();

        endTime.setHours(endTime.getHours() + 24);

        return calculateTimeLeft(endTime);
    });

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

    return (
        <div className="bg-gradient-to-r from-black/80 to-gray-800 text-white p-6 rounded-2xl shadow-2xl max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between">
            <div className="flex items-center space-x-4 mb-4 md:mb-0">
                <Tag className="w-12 h-12 text-yellow-400 hidden md:block" />
                <div>
                    <h2 className="text-2xl font-bold text-yellow-300">Luxury Flash Sale</h2>
                    <p className="text-sm text-gray-300">Exclusive 24-Hour Deals</p>
                </div>
            </div>

            <div className="flex items-center space-x-4">
                {/* <Clock className="w-10 h-10 text-yellow-400" /> */}
                <div className="flex space-x-2 text-center">
                    {(["hours", "minutes", "seconds"] as const).map((timeUnit) => (
                        <div key={timeUnit} className="bg-white/20 p-2 rounded-lg w-16">
                            <span className="text-2xl font-bold">{timeLeft[timeUnit].toString().padStart(2, "0")}</span>
                            <p className="text-xs">{timeUnit.charAt(0).toUpperCase() + timeUnit.slice(1)}</p>
                        </div>
                    ))}
                </div>
            </div>

            <LocalizedClientLink
                className="mt-4 md:mt-0 bg-yellow-400 text-black px-6 py-1.5 rounded-full hover:bg-yellow-500 transition-colors flex items-center space-x-2"
                href="/collections"
            >
                <Cart className="w-5 h-5" />
                <span>Shop Now</span>
            </LocalizedClientLink>
        </div>
    );
};

export default FlashBanner;
