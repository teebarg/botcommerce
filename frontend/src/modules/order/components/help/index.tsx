import LocalizedClientLink from "@modules/common/components/localized-client-link";
import React from "react";

const Help = () => {
    return (
        <div className="mt-6">
            <h3 className="text-base">Need help?</h3>
            <div className="text-base-regular my-2">
                <ul className="gap-y-2 flex flex-col">
                    <li>
                        <LocalizedClientLink href="/contact">Contact</LocalizedClientLink>
                    </li>
                    <li>
                        <LocalizedClientLink href="/contact">Returns & Exchanges</LocalizedClientLink>
                    </li>
                </ul>
            </div>
        </div>
    );
};

export default Help;
