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
    const tags = [
        { title },
        { name: "description", content: description },
        { name: "keywords", content: keywords },
        { name: "og:type", content: "website" },
        { name: "og:title", content: title },
        { name: "og:description", content: description },
        { name: "og:url", content: url },
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
        ...(image
            ? [
                  { name: "twitter:image", content: image },
                  { name: "twitter:card", content: "summary_large_image" },
                  { name: "og:image", content: image },
                  { name: "og:image:width", content: "1200" },
                  { name: "og:image:height", content: "630" },
                  { name: "og:image:alt", content: name },
              ]
            : []),
    ];

    return tags;
};
