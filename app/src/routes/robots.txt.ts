import { createFileRoute } from "@tanstack/react-router";

const DOMAIN = process.env.API_URL ?? "http://localhost:3000";

export const Route = createFileRoute("/robots/txt")({
  loader: () => {
    return new Response(
      `
User-agent: *
Allow: /

Sitemap: ${DOMAIN}/api/sitemap.xml
      `.trim(),
      {
        headers: { "Content-Type": "text/plain" },
      }
    );
  },
});

