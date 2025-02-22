// Example API methods
export const exampleApi = {
    async hello(name: string): Promise<{ message: string }> {
        return { message: `Hi ${name}, welcome!` };
    },
};
