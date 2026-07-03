import { z } from "zod";

export const booleanParam = z
    .preprocess((v) => {
        if (typeof v === "boolean") return v;
        if (v === "true") return true;
        if (v === "false") return false;
        return v;
    }, z.boolean())
    .optional();

export const numberParam = z
    .preprocess((v) => {
        if (typeof v === "number") return v;
        if (typeof v === "string" && v.trim() !== "") {
            const n = Number(v);
            return Number.isNaN(n) ? v : n;
        }
        return v;
    }, z.number())
    .optional();