interface Product {
    name: string;
    sku: string;
    price: string;
    description: string;
    image_url: string | null;
}

interface ChatMessage {
    id: string;
    role: "agent" | "user";
    text: string;
    time: string;
    sources?: string[];
    escalated?: boolean;
    products?: Product[];
}

interface ChatResponse {
    reply: string;
    session_id: string;
    sources: string[];
    escalated: boolean;
    products: Product[];
}

interface ChatWidgetProps {
    customerId?: string | null;
    apiUrl?: string;
}


export function formatTime(date: Date): string {
    return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
}

// ── Text renderer (supports **bold** and newlines) ────────────────────────────

function renderText(text: string): React.ReactNode {
    return text.split(/(\*\*[^*]+\*\*)/g).map((part, i) => {
        if (part.startsWith("**") && part.endsWith("**"))
            return (
                <strong key={i} className="font-semibold">
                    {part.slice(2, -2)}
                </strong>
            );
        return part.split("\n").map((line, j, arr) => (
            <span key={`${i}-${j}`}>
                {line}
                {j < arr.length - 1 && <br />}
            </span>
        ));
    });
}

// ── Sub-components ────────────────────────────────────────────────────────────

export function TypingIndicator() {
    return (
        <div className="flex items-end gap-2.5">
            <AgentAvatar />
            <div className="bg-white rounded-[18px_18px_18px_4px] px-4 py-3 shadow-sm flex gap-1.5 items-center">
                {([0, 150, 300] as number[]).map((delay) => (
                    <span
                        key={delay}
                        className="w-2 h-2 rounded-full bg-slate-300 inline-block animate-bounce"
                        style={{ animationDelay: `${delay}ms`, animationDuration: "900ms" }}
                    />
                ))}
            </div>
        </div>
    );
}

export function AgentAvatar({ size = "sm" }: { size?: "sm" | "md" }) {
    const cls = size === "md" ? "w-10 h-10 text-base font-bold" : "w-8 h-8 text-xs font-bold";
    return (
        <div className={`${cls} rounded-full bg-gradient-to-br from-rose-500 to-amber-400 flex items-center justify-center text-white flex-shrink-0`}>
            A
        </div>
    );
}

function UserAvatar() {
    return <div className="w-8 h-8 rounded-full bg-slate-200 flex items-center justify-center text-slate-600 text-xs font-bold flex-shrink-0">U</div>;
}

function SourceBadges({ sources }: { sources: string[] }) {
    if (!sources?.length) return null;
    const icons: Record<string, string> = {
        Products: "🛍️",
        Faqs: "❓",
        Policies: "📋",
    };
    return (
        <div className="flex gap-1.5 flex-wrap mt-2">
            {sources.map((s) => (
                <span
                    key={s}
                    className="text-[10px] px-2 py-0.5 rounded-full bg-slate-100 text-slate-500 border border-slate-200 font-medium tracking-wide"
                >
                    {icons[s] ?? "📄"} {s}
                </span>
            ))}
        </div>
    );
}

function EscalationBanner() {
    return (
        <div className="mt-2.5 px-3 py-2 rounded-xl bg-amber-50 border border-amber-200 text-amber-800 text-xs flex items-center gap-2 leading-relaxed">
            <span className="w-2 h-2 rounded-full bg-amber-400 flex-shrink-0 animate-pulse" />
            Transferred to a human agent — someone will follow up shortly.
        </div>
    );
}

function ProductCard({ product }: { product: Product }) {
    return (
        <div className="min-w-[136px] max-w-[136px] rounded-2xl border border-slate-100 bg-white overflow-hidden flex-shrink-0 shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all duration-200 cursor-pointer">
            {product.image_url ? (
                <img src={product.image_url} alt={product.name} className="w-full h-[90px] object-cover" />
            ) : (
                <div className="w-full h-[90px] bg-slate-50 flex items-center justify-center text-3xl">👗</div>
            )}
            <div className="p-2.5">
                <p className="text-[11px] font-semibold text-slate-800 leading-tight line-clamp-2">{product.name}</p>
                <p className="text-[9px] text-slate-400 mt-1 font-mono">{product.sku}</p>
                <p className="text-sm font-bold text-rose-500 mt-1">{product.price}</p>
            </div>
        </div>
    );
}

export function ChatBubble({ msg }: { msg: ChatMessage }) {
    const isAgent = msg.role === "agent";

    return (
        <div className={`flex items-end gap-2.5 ${isAgent ? "justify-start" : "justify-end"}`}>
            {isAgent && <AgentAvatar />}

            <div className="max-w-[73%] min-w-0">
                {/* Bubble */}
                <div
                    className={
                        isAgent
                            ? "bg-white text-slate-800 rounded-[18px_18px_18px_4px] px-3.5 py-2.5 text-[13.5px] leading-relaxed shadow-sm"
                            : "bg-slate-900 text-slate-100 rounded-[18px_18px_4px_18px] px-3.5 py-2.5 text-[13.5px] leading-relaxed"
                    }
                >
                    {renderText(msg.text)}
                </div>

                {/* Product cards */}
                {isAgent && !!msg.products?.length && (
                    <div className="flex gap-2 mt-2.5 overflow-x-auto pb-1 scrollbar-none">
                        {msg.products.map((p) => (
                            <ProductCard key={p.sku} product={p} />
                        ))}
                    </div>
                )}

                {isAgent && <SourceBadges sources={msg.sources ?? []} />}
                {isAgent && msg.escalated && <EscalationBanner />}

                <p className={`text-[10px] text-slate-400 mt-1 mx-0.5 ${isAgent ? "text-left" : "text-right"}`}>{msg.time}</p>
            </div>

            {!isAgent && <UserAvatar />}
        </div>
    );
}
