import { Message } from "../models";

const buildUrl = (baseUrl: string, queryParams: Record<string, string | number | Date | undefined | null>): string => {
    let url = baseUrl;
    let firstQueryParam = true;

    for (const key in queryParams) {
        if (!queryParams[key]) continue;
        // eslint-disable-next-line no-prototype-builtins
        if (queryParams.hasOwnProperty(key)) {
            if (firstQueryParam) {
                url += `?${key}=${queryParams[key]}`;
                firstQueryParam = false;
            } else {
                url += `&${key}=${queryParams[key]}`;
            }
        }
    }

    return url;
};

const currency = (number: number): string => {
    return number?.toLocaleString("en-NG", { style: "currency", currency: "NGN", maximumFractionDigits: 0 });
};

const capitalize = (str: string): string => {
    return str.charAt(0).toUpperCase() + str.slice(1);
};

// eslint-disable-next-line
const debounce = <T extends (...args: any[]) => void>(func: T, delay: number): ((...args: Parameters<T>) => void) => {
    let timer: NodeJS.Timeout;

    return (...args: Parameters<T>) => {
        clearTimeout(timer);
        timer = setTimeout(() => {
            func(...args);
        }, delay);
    };
};

const isEqual = (value: any, other: any): boolean => {
    // Check if the values are strictly equal
    if (value === other) {
        return true;
    }

    // Check if either value is null or undefined
    if (value == null || other == null) {
        return value === other;
    }

    // Check if the types are different
    if (typeof value !== typeof other) {
        return false;
    }

    // Handle arrays
    if (Array.isArray(value) && Array.isArray(other)) {
        if (value.length !== other.length) {
            return false;
        }
        for (let i = 0; i < value.length; i++) {
            if (!isEqual(value[i], other[i])) {
                return false;
            }
        }

        return true;
    }

    // Handle objects
    if (typeof value === "object" && typeof other === "object") {
        const valueKeys = Object.keys(value);
        const otherKeys = Object.keys(other);

        if (valueKeys.length !== otherKeys.length) {
            return false;
        }

        for (const key of valueKeys) {
            if (!otherKeys.includes(key) || !isEqual(value[key], other[key])) {
                return false;
            }
        }

        return true;
    }

    // For all other types, use strict equality
    return value === other;
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
const timeAgo = (timestamp: string) => {
    const now = new Date();
    const activityDate = new Date(timestamp);
    const diff = Math.floor((now.getTime() - activityDate.getTime()) / 1000);

    if (diff < 60) return `${diff} seconds ago`;
    else if (diff < 3600) return `${Math.floor(diff / 60)} minutes ago`;
    else if (diff < 86400) return `${Math.floor(diff / 3600)} hours ago`;
    else return `${Math.floor(diff / 86400)} days ago`;
};

const handleError = (error: any): Message => {
    return { message: (error as Error).message || "An error occurred", error: true };
};

export { handleError, capitalize, currency, buildUrl, debounce, isEqual, omit, generateId, timeAgo };
