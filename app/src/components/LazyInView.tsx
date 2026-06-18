import { useState, useRef, useEffect, type ReactNode } from "react";

interface LazyInViewProps {
    children: ReactNode;
    fallback?: ReactNode;
    rootMargin?: string
}

export function LazyInView({ children, fallback = null, rootMargin = "300px" }: LazyInViewProps) {
    const [isIntersected, setIsIntersected] = useState<boolean>(false);
    const ref = useRef<HTMLDivElement | null>(null);

    useEffect(() => {
        if (isIntersected) return;

        const observer = new IntersectionObserver(
            ([entry]) => {
                if (entry.isIntersecting) {
                    setIsIntersected(true);
                }
            },
            {
                rootMargin
            }
        );

        if (ref.current) {
            observer.observe(ref.current);
        }

        return () => observer.disconnect();
    }, [isIntersected]);

    return (
        <div ref={ref} className="w-full min-h-[200px]">
            {isIntersected ? children : fallback}
        </div>
    );
}
