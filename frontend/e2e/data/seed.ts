export async function seedData() {
    return {
        user: {
            first_name: "Test",
            last_name: "User",
            email: "test@example.com",
            password: "password",
        },
    };
}
