"use client";

import React from "react";
import { SnackbarProvider } from "notistack";

interface Props {
    children: React.ReactNode;
}

const NotificationProviders: React.FC<Props> = ({ children }) => {
    return (
        <SnackbarProvider anchorOrigin={{ horizontal: "right", vertical: "top" }} maxSnack={5}>
            {children}
        </SnackbarProvider>
    );
};

export default NotificationProviders;
