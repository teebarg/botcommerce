import React from "react";
import Footer from "@modules/layout/templates/footer";
import Navbar from "@modules/layout/templates/nav";

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
