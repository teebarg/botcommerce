import { z } from "zod";

/* -----------------------------
   Phone Utilities
------------------------------*/

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

export const phoneSchema = z
    .string()
    .transform((val) => normalizePhone(val))
    .refine((val) => /^234[789][01]\d{8}$/.test(val), {
        message: "Enter a valid Nigerian mobile number",
    });

/* -----------------------------
   Email Schema
------------------------------*/

export const emailSchema = z.string().email("Enter a valid email address").toLowerCase();

// export const phoneSchema = z
//     .string()
//     .trim()
//     .regex(/^\+?[0-9]{7,15}$/, "Invalid phone number")
//     .optional()
//     .or(z.literal(""));

export const addressSchema = z.object({
    address_type: z.enum(["HOME", "WORK", "BILLING", "SHIPPING", "OTHER"]).optional(),

    first_name: z.string().min(1, "First name is required"),
    last_name: z.string().min(1, "Last name is required"),
    address_1: z.string().min(1, "Address is required"),
    address_2: z.string().optional(),
    city: z.string().optional(),
    state: z.string().min(1, "State is required"),
    phone: phoneSchema,
});
