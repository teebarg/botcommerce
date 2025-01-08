import React, { useEffect, useState } from "react";
import { useUpdateQuery } from "@lib/hooks/useUpdateQuery";
import { useSearchParams } from "next/navigation";

import { Checkbox } from "@/components/ui/checkbox";

interface CheckboxGroupProps {
    groupName: string;
    checkboxes: Record<string, any>[];
    item?: any;
    facets?: {
        categories: Record<string, string>;
        collections: Record<string, string>;
    };
}

const CheckboxGroup: React.FC<CheckboxGroupProps> = ({ groupName, checkboxes, facets, item }) => {
    const { updateQuery } = useUpdateQuery(200);
    const [dataSet, setDataSet] = useState(new Set());

    const searchParams = useSearchParams();

    // Handle parent checkbox change
    const handleParentChange = (checked: boolean) => {
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
    const handleChildChange = (checked: boolean, slug: string) => {
        // if (!checked) {
        //     setParentChecked(false); // Uncheck parent if any child is unchecked
        // } else if (checkedIds.length === checkboxes.length) {
        //     setParentChecked(true); // Check parent if all children are checked
        // }

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
        const newSet = new Set(catIdsFromURL);

        setDataSet(newSet);
    }, [searchParams, checkboxes]);

    return (
        <React.Fragment>
            <div style={{ marginBottom: "20px" }}>
                <Checkbox isSelected={dataSet.has(item.slug)} label={groupName} onChange={handleParentChange} />
                <div className="space-y-2 mt-2" style={{ marginLeft: "22px" }}>
                    {checkboxes.map((checkbox) => (
                        <div key={`sub-${checkbox.slug}`} className="flex justify-between">
                            <Checkbox
                                isSelected={dataSet.has(checkbox.slug)}
                                label={checkbox.name}
                                onChange={(e) => handleChildChange(e, checkbox.slug)}
                            />
                            {facets?.categories && <span>({facets["categories"][checkbox.name] ?? 0})</span>}
                        </div>
                    ))}
                </div>
            </div>
        </React.Fragment>
    );
};

export { CheckboxGroup };
