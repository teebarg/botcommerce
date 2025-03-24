/* eslint-disable @typescript-eslint/no-unsafe-argument */
import type React from "react";

import { format } from "date-fns";

interface DateTimePickerProps {
    value: Date | undefined;
    onChange: (date: Date | undefined) => void;
    minDate?: Date;
}

const DateTimePicker: React.FC<DateTimePickerProps> = ({ value, onChange, minDate = new Date() }) => {
    const formatDateTime = (date: Date) => {
        // eslint-disable-next-line @typescript-eslint/no-unsafe-return
        return format(date, "yyyy-MM-dd'T'HH:mm");
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const newDate = e.target.value ? new Date(e.target.value) : undefined;

        onChange(newDate);
    };

    return (
        <input
            className="px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            min={formatDateTime(minDate)}
            type="datetime-local"
            value={value ? formatDateTime(value) : ""}
            onChange={handleChange}
        />
    );
};

export { DateTimePicker };
