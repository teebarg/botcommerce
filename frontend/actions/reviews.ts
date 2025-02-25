import { api } from "@/apis";

export async function updateReview(currentState: unknown, formData: FormData) {
    const id = formData.get("id") as string;
    const data = {
        verified: Boolean(formData.get("verified")) ?? false,
        rating: Number(formData.get("rating")),
        comment: formData.get("comment") as string,
    };

    return await api.review.update(id, data);
}
