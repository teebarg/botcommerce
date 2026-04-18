interface MobilePreviewProps {
    title: string;
    body: string;
    appName?: string;
    imageUrl?: string;
}

export const MobilePreview = ({ title, body, appName = "Aura", imageUrl }: MobilePreviewProps) => {
    return (
        <div className="w-full max-w-[300px] mx-auto">
            <div className="relative w-full aspect-[9/15] bg-stone border-2 border-foreground rounded-[2.75rem] shadow-[0_20px_40px_-15px_hsl(var(--foreground)/0.15)] overflow-hidden">
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-28 h-6 bg-foreground rounded-b-2xl z-20" />

                {/* Screen content */}
                <div className="relative z-10 w-full h-full flex flex-col px-4 pt-12 pb-8">
                    <div className="text-center mb-12">
                        <span className="text-5xl font-light text-foreground/80 tracking-tighter tabular-nums">09:41</span>
                        <p className="text-xs text-foreground/60 mt-2 font-medium">Wednesday, October 12</p>
                    </div>

                    {/* Notification card */}
                    <div
                        className="bg-card backdrop-blur-xl rounded-2xl p-3.5 shadow-[0_8px_30px_hsl(var(--foreground)/0.06)] border border-background/60 animate-in fade-in slide-in-from-top-2 duration-500"
                        key={title + body}
                    >
                        <div className="flex justify-between items-center mb-2">
                            <div className="flex items-center gap-2 min-w-0">
                                <div className="size-5 bg-foreground rounded-md flex items-center justify-center shrink-0">
                                    <span className="text-[10px] text-background font-semibold">{appName.charAt(0)}</span>
                                </div>
                                <span className="text-xs font-semibold text-foreground/80 tracking-tight uppercase truncate">{appName}</span>
                            </div>
                            <span className="text-[11px] text-foreground/50 shrink-0 ml-2">now</span>
                        </div>
                        <h4 className="text-sm font-semibold text-foreground leading-tight mb-1 line-clamp-2">
                            {title || "Your headline appears here"}
                        </h4>
                        <p className="text-[13px] text-foreground/80 leading-snug line-clamp-3">
                            {body || "Compose your narrative on the left to see it render in real time on the device."}
                        </p>
                        {imageUrl && (
                            <div className="mt-3 -mx-1 rounded-lg overflow-hidden aspect-[2/1]">
                                <img src={imageUrl} alt="" className="w-full h-full object-cover" />
                            </div>
                        )}
                    </div>
                </div>

                {/* Home indicator */}
                <div className="absolute bottom-2 left-1/2 -translate-x-1/2 w-32 h-1 bg-foreground/20 rounded-full z-20" />
            </div>
        </div>
    );
};
