export async function updateAuthSession(data: any) {
    const csrfRes = await fetch("/api/auth/csrf");
    const { csrfToken } = await csrfRes.json();

    const res = await fetch("/api/auth/session", {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify({
            csrfToken,
            data,
        }),
    });

    if (!res.ok) throw new Error("Failed to update session");

    return await res.json();
}
