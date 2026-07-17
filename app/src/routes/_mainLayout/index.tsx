import { createFileRoute } from "@tanstack/react-router";
import { HERO_IMAGES } from "@/utils/constants";
import { categoriesProductsQuery, indexProductsQuery } from "@/hooks/useProduct";

export const Route = createFileRoute("/_mainLayout/")({
    loader: async ({ context }) => {
        context.queryClient.fetchQuery(indexProductsQuery());
        context.queryClient.fetchQuery(categoriesProductsQuery());

        const safeIndex = new Date().getDate() % HERO_IMAGES.length;
        const image = HERO_IMAGES[safeIndex];
        return {
            heroImage: image,
        };
    },
});
