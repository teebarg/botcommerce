"use client";

import { useState } from "react";
import Register from "@modules/account/components/register";
import Login from "@modules/account/components/login";

export enum LOGIN_VIEW {
    SIGN_IN = "sign-in", // eslint-disable-line
    REGISTER = "register", // eslint-disable-line
}

const LoginTemplate = () => {
    const [currentView, setCurrentView] = useState("sign-in");

    return (
        <div className="w-full flex justify-start py-4 md:px-8 md:py-8">
            {currentView === "sign-in" ? <Login setCurrentView={setCurrentView} /> : <Register setCurrentView={setCurrentView} />}
        </div>
    );
};

export default LoginTemplate;
