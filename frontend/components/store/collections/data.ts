const openingHours = [
    {
        day: "Monday",
        time: "9:00am - 10:00pm",
    },
    {
        day: "Tuesday",
        time: "9:00am - 10:00pm",
    },
    {
        day: "Wednesday",
        time: "9:00am - 10:00pm",
    },
    {
        day: "Thursday",
        time: "9:00am - 10:00pm",
    },
    {
        day: "Friday",
        time: "9:00am - 10:00pm",
    },
    {
        day: "Saturday",
        time: "9:00am - 6:00pm",
    },
    {
        day: "Sunday",
        time: "9:00am - 12:00pm",
    },
];

const filters = [
    { id: "created_at:desc", name: "Newest" },
    { id: "min_variant_price:asc", name: "Price: Low -> High" },
    { id: "min_variant_price:desc", name: "Price: High -> Low" },
];

const states = [
    { id: "Lagos", name: "Lagos" },
    { id: "Abuja", name: "Abuja" },
    { id: "Rivers", name: "Rivers" },
];

export { openingHours, filters, states };
