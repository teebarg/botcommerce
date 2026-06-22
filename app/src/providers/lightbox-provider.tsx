import { createContext, useCallback, useContext, useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { X } from "lucide-react";

interface LightboxContextValue {
    open: (url: string, alt?: string) => void;
}

const LightboxContext = createContext<LightboxContextValue>({ open: () => { } });

export function LightboxProvider({ children }: { children: React.ReactNode }) {
    const [state, setState] = useState<{ url: string; alt: string } | null>(null);

    const open = useCallback((url: string, alt = "") => setState({ url, alt }), []);
    const close = useCallback(() => setState(null), []);

    useEffect(() => {
        if (!state) return;
        const onKey = (e: KeyboardEvent) => e.key === "Escape" && close();
        document.body.style.overflow = "hidden";
        window.addEventListener("keydown", onKey);
        return () => {
            document.body.style.overflow = "";
            window.removeEventListener("keydown", onKey);
        };
    }, [state, close]);

    return (
        <LightboxContext.Provider value={{ open }}>
            {children}
            {state && createPortal(
                <div
                    className="fixed inset-0 z-[100] bg-black/95 flex items-center justify-center animate-in fade-in duration-150"
                    onClick={close}
                >
                    <button
                        onClick={close}
                        className="absolute top-4 right-4 w-10 h-10 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white transition-colors"
                        aria-label="Close"
                    >
                        <X className="w-5 h-5" />
                    </button>
                    <img
                        src={state.url}
                        alt={state.alt}
                        className="max-w-[92vw] max-h-[88vh] object-contain"
                        // onClick={(e) => e.stopPropagation()}
                    />
                </div>,
                document.body
            )}
        </LightboxContext.Provider>
    );
}

export const useLightbox = () => useContext(LightboxContext);