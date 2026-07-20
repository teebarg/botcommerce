const currency = (number: number): string => {
    return number?.toLocaleString("en-NG", { style: "currency", currency: "NGN", maximumFractionDigits: 0 });
};

const debounce = <T extends (...args: any[]) => void>(func: T, delay: number): ((...args: Parameters<T>) => void) => {
    let timer: NodeJS.Timeout;

    return (...args: Parameters<T>) => {
        clearTimeout(timer);
        timer = setTimeout(() => {
            func(...args);
        }, delay);
    };
};

const omit = <T extends object, K extends keyof T>(obj: T, keys: K[] | K): Omit<T, K> => {
    const keysToOmit = Array.isArray(keys) ? keys : [keys];
    const result = { ...obj };

    for (const key of keysToOmit) {
        delete result[key];
    }

    return result as Omit<T, K>;
};

const generateId = (prefix: string = "cart_", length: number = 25): string => {
    const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
    let id = prefix;

    for (let i = 0; i < length; i++) {
        const randomIndex = Math.floor(Math.random() * chars.length);

        id += chars[randomIndex];
    }

    return id;
};

// Helper function to format timestamps into "time ago"
const timeAgo = (timestamp: string | undefined) => {
    if (!timestamp) {
        return
    }
    const now = new Date();
    const activityDate = new Date(timestamp);
    const diff = Math.floor((now.getTime() - activityDate.getTime()) / 1000);

    if (diff < 60) return `${diff} seconds ago`;
    else if (diff < 3600) return `${Math.floor(diff / 60)} minutes ago`;
    else if (diff < 86400) return `${Math.floor(diff / 3600)} hours ago`;
    else return `${Math.floor(diff / 86400)} days ago`;
};

const formatDate = (dateString?: string) => {
    if (!dateString) return "N/A";

    const date = new Date(dateString);

    return new Intl.DateTimeFormat("en-US", {
        weekday: "short",
        year: "numeric",
        month: "short",
        day: "numeric",
    }).format(date);
};

export const getInitials = (name: string) => {
    return name
        ?.split(" ")
        ?.map((n: string) => n[0])
        ?.join("")
        ?.toUpperCase()
        ?.slice(0, 2);
};

export const formatTime = (input: Date | string | undefined): string => {
    if (!input) return "No Date"
    try {
        let d: Date;

        if (typeof input === "string") {
            // Normalize DB format → ISO
            const normalized = input.includes("T") ? input : input.replace(" ", "T");

            d = new Date(normalized);
        } else {
            d = input;
        }

        if (isNaN(d.getTime())) {
            throw new Error("Invalid date");
        }

        return d.toLocaleTimeString([], {
            hour: "2-digit",
            minute: "2-digit",
        });
    } catch (error) {
        return "";
    }
};

const SESSION_KEY = "app_session_id";

export function getSessionId(): string {
    if (typeof window === "undefined") return "";
    return localStorage.getItem(SESSION_KEY) || ""; 
}

export const initializeAppSession = () => {
    if (typeof window !== "undefined") {
        let id = localStorage.getItem(SESSION_KEY);
        if (!id) {
            id = crypto.randomUUID();
            localStorage.setItem(SESSION_KEY, id);
        }
    }
};

export { currency, debounce, omit, generateId, timeAgo, formatDate };
