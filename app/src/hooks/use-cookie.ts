type CookieOptions = Partial<{
    path: string;
    domain: string;
    maxAge: number;
    secure: boolean;
    httpOnly: boolean;
    sameSite: "lax" | "strict" | "none";
}>;

const parseCookieValue = (value: string | null): any => {
    try {
        return value ? JSON.parse(value) : null;
    } catch {
        return value;
    }
};

export const useCookie = () => {
    const setCookie = (name: string, value: any, options: CookieOptions = {}): void => {
        const encodedValue = encodeURIComponent(JSON.stringify(value));
        const optionsString = Object.entries(options)
            .map(([key, value]) => `${key}=${value}`)
            .join("; ");

        document.cookie = `${name}=${encodedValue}; ${optionsString}`;
    };

    const getCookie = (name: string): string | undefined => {
        if (typeof document === "undefined") return undefined;
        const cookies = document.cookie.split("; ");
        const cookie = cookies.find((cookie) => cookie.startsWith(`${name}=`));

        if (!cookie) return undefined;
        const [, value] = cookie.split("=");

        return parseCookieValue(decodeURIComponent(value));
    };

    const removeCookie = (name: string) => {
        document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;`;
    };

    return { setCookie, getCookie, removeCookie };
};
