
import { noDivisionCurrencies } from "@lib/constants";

import { ProductVariantInfo, RegionInfo } from "../../types/global";

import { isEmpty } from "./isEmpty";

export const findCheapestRegionPrice = (variants: any[], regionId: string) => {
    const regionPrices = variants.reduce((acc, v) => {
        if (!v.prices) {
            return acc;
        }

        const price = v.prices.find((p) => p.region_id === regionId);

        if (price) {
            acc.push(price);
        }

        return acc;
    }, [] as any[]);

    if (!regionPrices.length) {
        return undefined;
    }

    //find the price with the lowest amount in regionPrices
    const cheapestPrice = regionPrices.reduce((acc: any, p: any) => {
        if (acc.amount > p.amount) {
            return p;
        }

        return acc;
    });

    return cheapestPrice;
};

export const findCheapestCurrencyPrice = (variants: any[], currencyCode: string) => {
    const currencyPrices = variants.reduce((acc, v) => {
        if (!v.prices) {
            return acc;
        }

        const price = v.prices.find((p) => p.currency_code === currencyCode);

        if (price) {
            acc.push(price);
        }

        return acc;
    }, [] as any[]);

    if (!currencyPrices.length) {
        return undefined;
    }

    //find the price with the lowest amount in currencyPrices
    const cheapestPrice = currencyPrices.reduce((acc: any, p: any) => {
        if (acc.amount > p.amount) {
            return p;
        }

        return acc;
    });

    return cheapestPrice;
};

export const findCheapestPrice = (variants: any[], region: any) => {
    const { id, currency_code } = region;

    let cheapestPrice = findCheapestRegionPrice(variants, id);

    if (!cheapestPrice) {
        cheapestPrice = findCheapestCurrencyPrice(variants, currency_code);
    }

    if (cheapestPrice) {
        return formatAmount({
            amount: cheapestPrice.amount,
            region: region,
        });
    }

    // if we can't find any price that matches the current region,
    // either by id or currency, then the product is not available in
    // the current region
    return "Not available in your region";
};

type FormatVariantPriceParams = {
    variant: ProductVariantInfo;
    region: RegionInfo;
    includeTaxes?: boolean;
    minimumFractionDigits?: number;
    maximumFractionDigits?: number;
    locale?: string;
};

/**
 * Takes a product variant and a region, and converts the variant's price to a localized decimal format
 */
export const formatVariantPrice = ({ variant, region, includeTaxes = true, ...rest }: FormatVariantPriceParams) => {
    const amount = computeVariantPrice({ variant, region, includeTaxes });

    return convertToLocale({
        amount,
        currency_code: region?.currency_code,
        ...rest,
    });
};

type ComputeVariantPriceParams = {
    variant: ProductVariantInfo;
    region: RegionInfo;
    includeTaxes?: boolean;
};

/**
 * Takes a product variant and region, and returns the variant price as a decimal number
 * @param params.variant - product variant
 * @param params.region - region
 * @param params.includeTaxes - whether to include taxes or not
 */
export const computeVariantPrice = ({ variant, region, includeTaxes = true }: ComputeVariantPriceParams) => {
    const amount = getVariantPrice(variant, region);

    return computeAmount({
        amount,
        region,
        includeTaxes,
    });
};

/**
 * Finds the price amount correspoding to the region selected
 * @param variant - the product variant
 * @param region - the region
 * @returns - the price's amount
 */
export const getVariantPrice = (variant: ProductVariantInfo, region: RegionInfo) => {
    const price = variant?.prices?.find((p) => p.currency_code.toLowerCase() === region?.currency_code?.toLowerCase());

    return price?.amount || 0;
};

type ComputeAmountParams = {
    amount: number;
    region: RegionInfo;
    includeTaxes?: boolean;
};

/**
 * Takes an amount, a region, and returns the amount as a decimal including or excluding taxes
 */
export const computeAmount = ({ amount, region, includeTaxes = true }: ComputeAmountParams) => {
    const toDecimal = convertToDecimal(amount, region);

    const taxRate = includeTaxes ? getTaxRate(region) : 0;

    const amountWithTaxes = toDecimal * (1 + taxRate);

    return amountWithTaxes;
};

type FormatAmountParams = {
    amount: number;
    region: RegionInfo;
    includeTaxes?: boolean;
    minimumFractionDigits?: number;
    maximumFractionDigits?: number;
    locale?: string;
};

/**
 * Takes an amount and a region, and converts the amount to a localized decimal format
 */
export const formatAmount = ({ amount, region, includeTaxes = true, ...rest }: FormatAmountParams) => {
    const taxAwareAmount = computeAmount({
        amount,
        region,
        includeTaxes,
    });

    return convertToLocale({
        amount: taxAwareAmount,
        currency_code: region?.currency_code,
        ...rest,
    });
};

const convertToDecimal = (amount: number, region: RegionInfo) => {
    const divisor = noDivisionCurrencies.includes(region?.currency_code?.toLowerCase()) ? 1 : 100;

    return Math.floor(amount) / divisor;
};

const getTaxRate = (region?: RegionInfo) => {
    return region && !isEmpty(region) ? region?.tax_rate / 100 : 0;
};

const convertToLocale = ({ amount, minimumFractionDigits, maximumFractionDigits }: ConvertToLocaleParams) => {
    return amount.toLocaleString("en-NG", { style: "currency", currency: "NGN", minimumFractionDigits, maximumFractionDigits });
};

type ConvertToLocaleParams = {
    amount: number;
    currency_code?: string;
    minimumFractionDigits?: number;
    maximumFractionDigits?: number;
    locale?: string;
};
