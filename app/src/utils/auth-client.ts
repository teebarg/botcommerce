export async function updateAuthSession(data: any) {
    // 1. Get the CSRF Token (Required by Auth.js for POST requests)
    const csrfRes = await fetch("/api/auth/csrf");
    const { csrfToken } = await csrfRes.json();

    // 2. Post to the session endpoint
    // This triggers the `jwt` callback with trigger: "update"
    const res = await fetch("/api/auth/session", {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify({
            csrfToken, // Include the token
            data, // This becomes 'session' in the jwt callback argument
        }),
    });

    if (!res.ok) throw new Error("Failed to update session");

    return await res.json();
}
