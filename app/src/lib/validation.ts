export const normalizePhone = (value: string) => {
    const digits = value.replace(/\D/g, "");

    if (digits.startsWith("0")) {
        return "234" + digits.slice(1);
    }

    if (digits.startsWith("234")) {
        return digits;
    }

    return digits;
};

export const formatPhone = (value: string) => {
    const digits = value.replace(/\D/g, "");

    if (!digits) return "";

    // Simple international-friendly format
    if (digits.startsWith("234")) {
        return `+${digits}`;
    }

    if (digits.startsWith("0")) {
        return `+234${digits.slice(1)}`;
    }

    return `+${digits}`;
};


