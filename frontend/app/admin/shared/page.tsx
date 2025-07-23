import SharedCollectionList from "@/components/admin/shared-collections/shared-collection-list";

export const metadata = {
    title: "Shared Collections",
};

export default function SharedAdminPage() {
    return (
        <div className="p-4">
            <h1 className="text-2xl font-bold mb-4">Shared Collections</h1>
            <SharedCollectionList />
        </div>
    );
}
