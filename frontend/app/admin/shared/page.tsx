import SharedCollectionList from "@/components/admin/shared-collections/shared-collection-list";

export const metadata = {
    title: "Catalogs",
};

export default function SharedAdminPage() {
    return (
        <div className="p-4">
            <SharedCollectionList />
        </div>
    );
}
