import { api } from "@/apis";

export async function updateReview(currentState: unknown, formData: FormData) {
    const id = formData.get("id") as unknown as number;
    const data = {
        rating: Number(formData.get("rating")),
        comment: formData.get("comment") as string,
    };

    const response = await api.review.update(id, data);

    if (response.error) {
        return { message: response.error, error: true };
    }

    return { message: "Review updated successfully", error: false };
}

export async function publishReview(id: number, publish: boolean) {
    const data = {
        verified: publish,
    };

    return await api.review.update(id, data);
}
