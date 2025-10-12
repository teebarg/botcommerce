// ✅ Set a cookie (only works on the client)
export async function setCookie(name: string, value: string, days = 7) {
    if (typeof window !== "undefined") {
        const expires = new Date();

        expires.setDate(expires.getDate() + days);
        document.cookie = `${name}=${encodeURIComponent(value)}; expires=${expires.toUTCString()}; path=/; SameSite=Lax`;
    }
}

// ✅ Delete a cookie (only works on the client)
export async function deleteCookie(name: string) {
    if (typeof window !== "undefined") {
        document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/; SameSite=Lax`;
    }
}

export function getCookie(name: string) {
    if (typeof window !== "undefined") {
        const match = document.cookie.match(`(^|;)\\s*${name}\\s*=\\s*([^;]+)`);

        return match ? decodeURIComponent(match[2]) : null;
    }
}
