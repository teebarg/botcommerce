import SharedCollectionList from "@/components/admin/shared-collections/shared-collection-list";

export const metadata = {
    title: "Shared Collections",
};

export default function SharedAdminPage() {
    return (
        <div className="p-4">
            <SharedCollectionList />
        </div>
    );
}
