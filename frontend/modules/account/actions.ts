"use server";

import { addShippingAddress, deleteShippingAddress, updateBillingAddress, updateCustomer, updateShippingAddress } from "@lib/data";
import { revalidateTag } from "next/cache";

import { getCookie } from "@/lib/util/server-utils";

export async function updateCustomerName(_currentState: Record<string, unknown>, formData: FormData) {
    const customer = {
        first_name: formData.get("first_name"),
        last_name: formData.get("last_name"),
    } as any;

    try {
        await updateCustomer(customer);
        revalidateTag("customer");

        return { success: true, error: null };
    } catch (error: any) {
        return { success: false, error: error.toString() };
    }
}

export async function updateCustomerEmail(_currentState: Record<string, unknown>, formData: FormData) {
    const customer = {
        email: formData.get("email"),
    } as any;

    try {
        await updateCustomer(customer).then(() => {
            revalidateTag("customer");
        });

        return { success: true, error: null };
    } catch (error: any) {
        return { success: false, error: error.toString() };
    }
}

export async function updateCustomerPhone(_currentState: Record<string, unknown>, formData: FormData) {
    const customer = {
        phone: formData.get("phone"),
    } as any;

    try {
        await updateCustomer(customer).then(() => {
            revalidateTag("customer");
        });

        return { success: true, error: null };
    } catch (error: any) {
        return { success: false, error: error.toString() };
    }
}

export async function updateCustomerPassword(
    currentState: {
        customer: Omit<any, "password_hash">;
        success: boolean;
        error: string | null;
    },
    formData: FormData
) {
    const email = currentState.customer.email as string;
    const new_password = formData.get("new_password") as string;
    const old_password = formData.get("old_password") as string;
    const confirm_password = formData.get("confirm_password") as string;

    // const isValid = await authenticate({ email, password: old_password })
    //     .then(() => true)
    //     .catch(() => false);

    // if (!isValid) {
    //     return {
    //         customer: currentState.customer,
    //         success: false,
    //         error: "Old password is incorrect",
    //     };
    // }

    if (new_password !== confirm_password) {
        return {
            customer: currentState.customer,
            success: false,
            error: "Passwords do not match",
        };
    }

    try {
        await updateCustomer({ password: new_password }).then(() => {
            revalidateTag("customer");
        });

        return {
            customer: currentState.customer,
            success: true,
            error: null,
        };
    } catch (error: any) {
        return {
            customer: currentState.customer,
            success: false,
            error: error.toString(),
        };
    }
}

export async function addCustomerShippingAddress(_currentState: Record<string, unknown>, formData: FormData) {
    const address = {
        first_name: formData.get("first_name") as string,
        last_name: formData.get("last_name") as string,
        address_1: formData.get("address_1") as string,
        address_2: formData.get("address_2") as string,
        city: formData.get("city") as string,
        postal_code: formData.get("postal_code") as string,
        state: formData.get("state") as string,
        phone: formData.get("phone") as string,
    } as any;

    try {
        await addShippingAddress(address);
        revalidateTag("address");

        return { success: true, error: null };
    } catch (error: any) {
        return { success: false, error: error.toString() };
    }
}

export async function updateCustomerShippingAddress(currentState: Record<string, unknown>, formData: FormData) {
    const addressId = currentState.addressId as string;

    const address = {
        first_name: formData.get("first_name") as string,
        last_name: formData.get("last_name") as string,
        address_1: formData.get("address_1") as string,
        address_2: formData.get("address_2") as string,
        city: formData.get("city") as string,
        postal_code: formData.get("postal_code") as string,
        state: formData.get("state") as string,
        phone: formData.get("phone") as string,
    } as any;

    try {
        await updateShippingAddress(addressId, address);
        revalidateTag("address");

        return { success: true, error: null, addressId };
    } catch (error: any) {
        return { success: false, error: error.toString(), addressId };
    }
}

export async function deleteCustomerShippingAddress(addressId: string | number) {
    try {
        await deleteShippingAddress(addressId);
        revalidateTag("address");

        return { success: true, error: null };
    } catch (error: any) {
        return { success: false, error: error.toString() };
    }
}

export async function updateCustomerBillingAddress(_currentState: Record<string, unknown>, formData: FormData) {
    const billing_address = {
        first_name: formData.get("billing_address.first_name"),
        last_name: formData.get("billing_address.last_name"),
        company: formData.get("billing_address.company"),
        address_1: formData.get("billing_address.address_1"),
        address_2: formData.get("billing_address.address_2"),
        city: formData.get("billing_address.city"),
        postal_code: formData.get("billing_address.postal_code"),
        state: formData.get("billing_address.state"),
        phone: formData.get("billing_address.phone"),
        is_billing: true,
    } as any;

    try {
        await updateBillingAddress(billing_address);
        revalidateTag("customer");

        return { success: true, error: null };
    } catch (error: any) {
        return { success: false, error: error.toString() };
    }
}

type resType = {
    success: boolean;
    message: string;
};

export async function submitContactForm(_currentState: resType, formData: FormData) {
    const name = formData.get("name") as string;
    const email = formData.get("email") as string;
    const phone = formData.get("phone");
    const message = formData.get("message") as string;

    try {
        const res = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/contact-form`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                accept: "application/json",
            },
            body: JSON.stringify({
                name,
                email,
                message,
                phone,
            }),
        });

        if (res.ok) {
            return { success: true, message: "Your message has been sent successfully" };
        } else {
            return { success: false, message: "Failed to send email" };
        }
    } catch (error: any) {
        return { success: false, message: error.toString() };
    }
}

export async function newsletterForm(_currentState: resType, formData: FormData) {
    const email = formData.get("email") as string;

    try {
        const res = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/newsletter`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                email,
            }),
        });

        if (res.ok) {
            return { success: true, message: "You have been subscribed to our newsletter" };
        } else {
            return { success: false, message: "Failed to send email" };
        }
    } catch (error: any) {
        return { success: false, message: error.toString() };
    }
}

export async function bulkUpload(formData: FormData) {
    const accessToken = await getCookie("access_token");

    try {
        const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/product/upload-products/`, {
            method: "POST",
            body: formData,
            headers: { "X-Auth": accessToken ?? "" },
        });

        if (response.ok) {
            revalidateTag("products");
            revalidateTag("search");

            return { success: true, message: "Products uploaded successfully" };
        } else {
            return { success: false, message: "Failed to upload products" };
        }
    } catch (error: any) {
        return { success: false, error: error.toString() };
    }
}
