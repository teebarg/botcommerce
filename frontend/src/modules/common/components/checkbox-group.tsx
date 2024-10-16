import React, { useEffect, useState } from "react";
import { useUpdateQuery } from "@lib/hooks/useUpdateQuery";
import { useSearchParams } from "next/navigation";

interface CheckboxGroupProps {
    groupName: string;
    checkboxes: Record<string, any>[];
    item?: any;
}

const CheckboxGroup: React.FC<CheckboxGroupProps> = ({ groupName, checkboxes, item }) => {
    const { updateQuery } = useUpdateQuery(1000);
    const [dataSet, setDataSet] = useState(new Set());

    const searchParams = useSearchParams();

    // Handle parent checkbox change
    const handleParentChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const checked = e.target.checked;
        // const checkedIds = checked ? checkboxes.map((checkbox) => checkbox.slug) : [];
        const newSet = new Set(dataSet);

        if (checked) {
            newSet.add(item.slug);
            checkboxes.forEach((element) => {
                newSet.add(element.slug);
            });
        } else {
            newSet.delete(item.slug);
            checkboxes.forEach((element) => {
                newSet.delete(element.slug);
            });
        }

        setDataSet(newSet);
        updateQuery([{ key: "cat_ids", value: Array.from(newSet).join(",") }]);
    };

    // Handle individual child checkbox change
    const handleChildChange = (e: React.ChangeEvent<HTMLInputElement>, slug: string) => {
        const checked = e.target.checked;

        // if (!checked) {
        //     setParentChecked(false); // Uncheck parent if any child is unchecked
        // } else if (checkedIds.length === checkboxes.length) {
        //     setParentChecked(true); // Check parent if all children are checked
        // }

        // updateURL(checkedIds); // Update the URL with the new checked IDs
        const newSet = new Set(dataSet);

        if (checked) {
            newSet.add(slug);
        } else {
            newSet.delete(slug);
        }

        setDataSet(newSet);
        updateQuery([{ key: "cat_ids", value: Array.from(newSet).join(",") }]);
    };

    // Sync the checked state with URL on component mount
    useEffect(() => {
        const catIdsFromURL = searchParams.get("cat_ids")?.split(",") || [];
        // const ids = item.children.map((i: any) => i.slug);
        // const newIds = [item.slug, ...ids];
        const newSet = new Set(catIdsFromURL);

        setDataSet(newSet);
    }, [searchParams, checkboxes]);

    return (
        <React.Fragment>
            <div style={{ marginBottom: "20px" }}>
                <div>
                    <input checked={dataSet.has(item.slug)} id={groupName} type="checkbox" onChange={handleParentChange} />
                    <label htmlFor={groupName} style={{ fontWeight: "bold", marginLeft: "8px" }}>
                        {groupName}
                    </label>
                </div>
                <div style={{ marginLeft: "20px" }}>
                    {checkboxes.map((checkbox) => (
                        <div key={`sub-${checkbox.slug}`}>
                            <input checked={dataSet.has(checkbox.slug)} type="checkbox" onChange={(e) => handleChildChange(e, checkbox.slug)} />
                            <label htmlFor={checkbox.slug} style={{ marginLeft: "8px" }}>
                                {checkbox.name}
                            </label>
                        </div>
                    ))}
                </div>
            </div>
        </React.Fragment>
    );
};

export { CheckboxGroup };