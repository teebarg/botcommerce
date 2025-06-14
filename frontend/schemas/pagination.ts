import { z } from "zod";

import { PagSchema } from "./common";

// Create a generic pagination factory
export function createPaginatedSchema<T extends z.ZodType>(itemSchema: T, itemsKey: string) {
    return PagSchema.extend({
        [itemsKey]: z.array(itemSchema),
    });
}
