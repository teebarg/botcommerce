export const seo = ({
    title,
    description,
    keywords,
    image,
    url,
    name,
}: {
    title: string;
    description?: string;
    image?: string;
    keywords?: string;
    url?: string;
    name?: string;
}) => {
    return [
        { title },
        { name: "description", content: description },
        { name: "keywords", content: keywords },
        { property: "og:type", content: "website" },
        { property: "og:title", content: title },
        { property: "og:description", content: description },
        { property: "og:url", content: url },
        { property: "og:image", content: image },
        { property: "og:image:width", content: "1200" },
        { property: "og:image:height", content: "630" },
        { property: "og:image:alt", content: name },
        { name: "twitter:card", content: "summary_large_image" },
        { name: "twitter:title", content: title },
        { name: "twitter:description", content: description },
        { name: "twitter:image", content: image },
    ];
};
