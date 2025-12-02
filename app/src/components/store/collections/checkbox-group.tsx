import React, { useEffect, useState } from "react";
import { useUpdateQuery } from "@/lib/hooks/useUpdateQuery";

import { Checkbox } from "@/components/ui/checkbox";
import { Facet } from "@/schemas/product";

interface CheckboxGroupProps {
    groupName: string;
    checkboxes?: Record<string, any>[];
    item?: any;
    facets?: Facet;
}

const CheckboxGroup: React.FC<CheckboxGroupProps> = ({ groupName, checkboxes, facets, item }) => {
    const { updateQuery } = useUpdateQuery(300);
    const [dataSet, setDataSet] = useState(new Set());

    const searchParams: any = null;

    const handleParentChange = (checked: boolean) => {
        const newSet = new Set(dataSet);

        if (checked) {
            newSet.add(item.slug);
            checkboxes?.forEach((element) => {
                newSet.add(element.slug);
            });
        } else {
            newSet.delete(item.slug);
            checkboxes?.forEach((element) => {
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

    useEffect(() => {
        const catIdsFromURL = searchParams.get("cat_ids")?.split(",") || [];
        const newSet = new Set(catIdsFromURL);

        setDataSet(newSet);
    }, [searchParams, checkboxes]);

    return (
        <div>
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-1">
                    <Checkbox
                        checked={dataSet.has(item.slug)}
                        onCheckedChange={(checked) => handleParentChange(checked == "indeterminate" ? false : checked)}
                    />
                    <label className="capitalize ml-1">{groupName}</label>
                </div>
                {facets?.category_slugs && <span>({facets["category_slugs"][groupName] ?? 0})</span>}
            </div>
            <div className="space-y-2 mt-2" style={{ marginLeft: "22px" }}>
                {checkboxes?.map((checkbox) => (
                    <div key={`sub-${checkbox.slug}`} className="flex justify-between">
                        <div>
                            <Checkbox
                                checked={dataSet.has(checkbox.slug)}
                                onCheckedChange={(checked) => handleChildChange(checked == "indeterminate" ? false : checked, checkbox.slug)}
                            />
                            <label className="capitalize ml-1">{checkbox.name}</label>
                        </div>
                        {facets?.category_slugs && <span>({facets["category_slugs"][checkbox.name] ?? 0})</span>}
                    </div>
                ))}
            </div>
        </div>
    );
};

export { CheckboxGroup };
