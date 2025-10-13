import { revalidateTag, revalidatePath } from "next/cache";

export async function POST(req: Request) {
    const { tag, path } = await req.json();

    if (tag) revalidateTag(tag);
    if (path) revalidatePath(path);

    return Response.json({ revalidated: true, now: Date.now() });
}
