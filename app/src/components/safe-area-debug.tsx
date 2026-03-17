export function SafeAreaDebug() {
    return (
        <>
            <div
                className="fixed top-0 inset-x-0 z-9999 bg-red-500 pointer-events-none"
                style={{ height: "var(--sat)" }}
            />
            <div
                className="fixed bottom-0 inset-x-0 z-9999 bg-red-500 pointer-events-none"
                style={{ height: "var(--sab)" }}
            />
        </>
    );
}
