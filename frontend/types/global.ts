export enum FileTypes {
    png = "image/png",
    jpeg = "image/jpeg",
    jpg = "image/jpg",
    avif = "image/avif",
    csv = "text/csv",
    xlsx = "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    xls = "application/vnd.ms-excel",
}

export type DeliveryOption = {
    id: string;
    name: string;
    amount: number;
};

export type PaymentSession = {
    id: string;
    provider_id: string;
};

export type SortOptions = "price_asc" | "price_desc" | "created_at";

export type Address = {
    created_at: string;
    updated_at: string;
    firstname: string;
    lastname: string;
    address_1: string;
    address_2: string;
    city: string;
    postal_code: string;
    state: string;
    phone: string;
    id: string;
};

export type SiteConfig = {
    id: number;
    key: string;
    value: string;
    created_at: string;
    updated_at: string;
};

export type IconProps = {
    color?: string;
    size?: string | number;
} & React.SVGAttributes<SVGElement>;
