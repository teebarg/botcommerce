import { createServerFn } from "@tanstack/react-start";
import { api } from "@/utils/api.server";
import type { PaginatedProductImages } from "@/schemas";

export const getProductImagesFn = createServerFn().handler(async () => await api.get<PaginatedProductImages>("/gallery/"));
