import React from "react";

import Footer from "@/components/generic/layout/templates/footer";
import Navbar from "@/components/generic/layout/templates/nav";

const Layout: React.FC<{
    children: React.ReactNode;
}> = ({ children }) => {
    return (
        <div>
            <Navbar />
            <main className="relative">{children}</main>
            <Footer />
        </div>
    );
};

export default Layout;
