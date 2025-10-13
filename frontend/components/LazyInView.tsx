"use client";
import React, { useState, useRef, useEffect } from "react";

export function LazyInView({ children, rootMargin = "200px" }: { children: React.ReactNode; rootMargin?: string }) {
    const [isVisible, setIsVisible] = useState<boolean>(false);
    const ref = useRef<HTMLDivElement | null>(null);

    useEffect(() => {
        const observer = new IntersectionObserver(
            (entries) => {
                if (entries[0].isIntersecting) {
                    setIsVisible(true);
                    observer.disconnect();
                }
            },
            { rootMargin }
        );

        if (ref.current) observer.observe(ref.current);

        return () => observer.disconnect();
    }, [rootMargin]);

    return <div ref={ref}>{isVisible ? children : null}</div>;
}
