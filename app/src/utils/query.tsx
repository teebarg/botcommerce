import { useSuspenseQuery } from "@tanstack/react-query";

function SuspenseQuery<T>({ queryOptions, children }: { queryOptions: any; children: (data: T) => React.ReactNode }) {
    const { data } = useSuspenseQuery(queryOptions);
    return <>{children(data)}</>;
}

export default SuspenseQuery;