"use client";

import React from "react";
import { SnackbarProvider } from "notistack";

export function NotificationProviders({ children }: { children: React.ReactNode }) {
    return (
        <SnackbarProvider anchorOrigin={{ horizontal: "right", vertical: "top" }} maxSnack={5}>
            {children}
        </SnackbarProvider>
    );
}
