"use client";

import { RightArrow } from "nui-react-icons";
import React from "react";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

import { cn } from "@/lib/util/cn";
import { Button } from "@/components/ui/button";

interface ComponentProps {}

const Banner: React.FC<ComponentProps> = () => {
    const router = useRouter();
    const [currentSlide, setCurrentSlide] = useState<number>(0);
    const content = ["Summer Sale 😍 🌴 Save 30% off selected seasonal items", "Buy clothes worth 20,000 naira and get Free Gift Card"];

    useEffect(() => {
        const interval = setInterval(() => {
            setCurrentSlide((prevSlide) => (prevSlide + 1) % content.length);
        }, 3000);

        return () => clearInterval(interval);
    }, [content.length]);

    return (
        <div className="hidden md:flex w-full items-center justify-between md:justify-center gap-x-3 py-2 border-b px-4 sm:px-0">
            {content.map((item, index) => (
                <div
                    key={index}
                    className={cn(
                        "transition-opacity duration-1000",
                        index === currentSlide ? "opacity-100 flex items-center justify-between md:justify-center gap-2 w-full" : "opacity-0 hidden"
                    )}
                >
                    <div className="text-sm flex items-end sm:text-[0.93rem] text-foreground hover:opacity-80 transition-opacity">
                        <span aria-label="rocket" className="hidden md:block" role="img">
                            🚀
                        </span>
                        <span
                            className="inline-flex md:ml-1 animate-text-gradient font-medium bg-clip-text text-transparent bg-[linear-gradient(90deg,#D6009A_0%,#8a56cc_50%,#D6009A_100%)] dark:bg-[linear-gradient(90deg,#FFEBF9_0%,#8a56cc_50%,#FFEBF9_100%)]"
                            style={{ fontSize: "inherit", backgroundSize: "200%", backgroundClip: "text" }}
                        >
                            {item}
                        </span>
                    </div>

                    <Button
                        aria-label="shop now"
                        className="min-w-[100px] !rounded-full p-[1px]"
                        size="sm"
                        onClick={() => router.push("/collections")}
                    >
                        <span className="absolute inset-[-1000%] animate-[spin_3s_linear_infinite] bg-[conic-gradient(from_90deg_at_50%_50%,#F54180_0%,#338EF7_50%,#F54180_100%)]" />
                        <div className="inline-flex h-full w-full cursor-pointer items-center justify-center rounded-full bg-background group-hover:bg-background/70 transition-background px-3 py-1 text-sm font-medium text-foreground backdrop-blur-3xl">
                            Shop Now
                            <RightArrow
                                aria-hidden="true"
                                className="outline-none transition-transform group-hover:translate-x-0.5 [&amp;>path]:stroke-[2px]"
                                role="img"
                                size={16}
                            />
                        </div>
                    </Button>
                </div>
            ))}
        </div>
    );
};

export default Banner;
