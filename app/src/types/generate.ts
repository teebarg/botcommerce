type PaginatedResponse<T> = {
    next_cursor?: string | null;
    items: T[];
};
