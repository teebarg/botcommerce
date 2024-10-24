"use server";

import { createCustomer, getToken } from "@lib/data";
import { revalidateTag } from "next/cache";

export async function signUp(_currentState: unknown, formData: FormData) {
    const customer = {
        email: formData.get("email"),
        password: formData.get("password"),
        firstname: formData.get("first_name"),
        lastname: formData.get("last_name"),
        phone: formData.get("phone"),
    } as any;

    try {
        await createCustomer(customer);
        await getToken({ email: customer.email, password: customer.password }).then(() => {
            revalidateTag("customer");
        });
    } catch (error: any) {
        return { error: true, message: error.toString() };
    }
}

export async function signIn(_prevState: unknown, formData: FormData) {
    const email = formData.get("email") as string;
    const password = formData.get("password") as string;

    try {
        await getToken({ email, password });
        revalidateTag("customer");

        return { error: false, message: "Authentication successful" };
    } catch (error: any) {
        return { error: true, message: error.toString() };
    }
}
