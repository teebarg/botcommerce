export const seo = ({
    title,
    description,
    keywords,
    image,
    url,
}: {
    title: string;
    description?: string;
    image?: string;
    keywords?: string;
    url?: string;
}) => {
    return [
        { title },
        { name: "description", content: description },
        { name: "keywords", content: keywords },
        { property: "og:title", content: title },
        { property: "og:description", content: description },
        { property: "og:type", content: "website" },
        { property: "og:url", content: url },
        { name: "twitter:card", content: "summary_large_image" },
        { name: "twitter:title", content: title },
        { name: "twitter:description", content: description },
        ...(image
            ? [
                  { property: "og:image", content: image },
                  { property: "og:image:secure_url", content: image },
                  { property: "og:image:type", content: "image/jpeg" },
                  { property: "og:image:width", content: "1200" },
                  { property: "og:image:height", content: "630" },
                  { property: "og:image:alt", content: title },
                  { name: "twitter:image", content: image },
              ]
            : []),
    ];
};
