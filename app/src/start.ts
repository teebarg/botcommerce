import { clerkMiddleware } from "@clerk/tanstack-react-start/server";
import { createStart } from "@tanstack/react-start";
import { initializeAppSession } from "./utils";

initializeAppSession();

export const startInstance = createStart(() => {
    return {
        defaultSsr: true,
        requestMiddleware: [clerkMiddleware()],
    };
});