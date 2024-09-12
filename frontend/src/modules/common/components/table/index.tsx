import React from "react";

interface Props {
    children: React.ReactNode;
    columns: string[];
}

const Table: React.FC<Props> = ({ columns, children }) => {
    return (
        <React.Fragment>
            <div className="mt-8 flow-root">
                <div className="-mx-4 -my-2 overflow-x-auto sm:-mx-6 lg:-mx-8">
                    <div className="inline-block min-w-full py-2 align-middle sm:px-6 lg:px-8">
                        <div className="overflow-hidden shadow ring-1 ring-black ring-opacity-5 sm:rounded-lg">
                            <table className="min-w-full divide-y divide-gray-200 dark:divide-content3">
                                <thead>
                                    <tr>
                                        {columns.map((column: string, index: number) => (
                                            <th key={index} className="py-3.5 pl-4 pr-3 text-left text-xs font-semibold text-default-500" scope="col">
                                                {column}
                                            </th>
                                        ))}
                                    </tr>
                                </thead>
                                <tbody className="bg-content1">{children}</tbody>
                            </table>
                        </div>
                    </div>
                </div>
            </div>
        </React.Fragment>
    );
};

export { Table };
