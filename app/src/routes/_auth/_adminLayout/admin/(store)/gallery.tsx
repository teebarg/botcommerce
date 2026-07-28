import { createFileRoute } from "@tanstack/react-router";
import { GalleryQuerySchema } from "@/schemas";

export const Route = createFileRoute("/_auth/_adminLayout/admin/(store)/gallery")({
    validateSearch: GalleryQuerySchema,
    loaderDeps: ({ search }) => search,
});
