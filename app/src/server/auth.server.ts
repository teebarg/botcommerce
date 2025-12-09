import { getRequest } from "@tanstack/react-start/server";
import { authConfig } from "@/utils/auth";
import { getSession } from "start-authjs";

export async function getSessionFromContext() {
    const request = getRequest();
    return await getSession(request, authConfig);
}
