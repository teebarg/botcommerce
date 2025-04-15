import { isEqual, omit } from "./util";

export default function compareAddresses(address1: any, address2: any) {
    const sanitizedAddress1 = omit(address1, [
        "id",
        "created_at",
        "updated_at",
        "deleted_at",
        "metadata",
        "customer_id",
        "user_id",
        "address_2",
        "is_billing",
        "company",
        "billing_carts",
        "billing_orders",
        "user",
        "shipping_carts",
        "shipping_orders",
    ]);
    const sanitizedAddress2 = omit(address2, [
        "id",
        "created_at",
        "updated_at",
        "deleted_at",
        "metadata",
        "customer_id",
        "user_id",
        "address_2",
        "is_billing",
        "company",
        "billing_carts",
        "billing_orders",
        "user",
        "shipping_carts",
        "shipping_orders",
    ]);

    return isEqual(sanitizedAddress1, sanitizedAddress2);
}
