import { CheckMini, ChevronDownMini, XMarkMini } from "nui-react-icons";
import React, { useEffect, useRef, useState } from "react";

interface Option {
    id: string | number;
    name: string;
}

interface MultiselectProps {
    label: string;
    options: Option[];
    [key: string]: any;
}

const SideBar: React.FC<MultiselectProps> = ({ name, label, options, defaultValue, ...props }) => {
    return (
        <React.Fragment>
            <p>Construct</p>
        </React.Fragment>
    );
};

export { SideBar };
