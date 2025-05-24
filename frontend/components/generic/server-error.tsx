"use client";

import React from "react";

import NotFoundUI from "./not-found";

const ServerError: React.FC = () => {
    return <NotFoundUI className="h-full" scenario="server" />;
};

export default ServerError;
