import Coupon from "@/components/admin/coupons/coupon";
import { Metadata } from "next";

export const metadata: Metadata = {
    title: "Coupons",
};

export default async function CouponsPage() {
    return <Coupon />;
}
