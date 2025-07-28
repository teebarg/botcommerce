import { create } from "zustand";

interface Product {
    id: number;
    name: string;
}

interface SharedCollectionDraftState {
    title: string;
    description: string;
    products: Product[];
    setTitle: (title: string) => void;
    setDescription: (desc: string) => void;
    addProduct: (product: Product) => void;
    removeProduct: (id: number) => void;
    clearDraft: () => void;
}

export const useSharedCollectionDraft = create<SharedCollectionDraftState>((set, get) => ({
    title: "",
    description: "",
    products: [],
    setTitle: (title) => set({ title }),
    setDescription: (description) => set({ description }),
    addProduct: (product) => {
        if (!get().products.find((p) => p.id === product.id)) {
            set((state) => ({ products: [...state.products, product] }));
        }
    },
    removeProduct: (id) => set((state) => ({ products: state.products.filter((p) => p.id !== id) })),
    clearDraft: () => set({ title: "", description: "", products: [] }),
}));
