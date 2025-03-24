import { create } from "zustand";

import { Category, Collection, Product, Brand } from "@/lib/models";

interface StoreState {
    count: number;
    increase: () => void;
    decrease: () => void;
    products: Product[];
    addProduct: (product: Product) => void;
    removeProduct: (id: number) => void;
    updateProduct: (id: number, product: Product) => void;
    clearProducts: () => void;
    setProducts: (products: Product[]) => void;

    collections: Collection[];
    addCollection: (collection: Collection) => void;
    removeCollection: (id: number) => void;
    updateCollection: (id: number, collection: Collection) => void;
    clearCollections: () => void;
    setCollections: (collections: Collection[]) => void;

    categories: Category[];
    setCategories: (categories: Category[]) => void;

    brands: Brand[];
    setBrands: (brands: Brand[]) => void;
}

export const useStore = create<StoreState>((set) => ({
    count: 0,
    increase: () => set((state) => ({ count: state.count + 1 })),
    decrease: () => set((state) => ({ count: state.count - 1 })),
    products: [],
    addProduct: (product: Product) => set((state) => ({ products: [...state.products, product] })),
    removeProduct: (id) => set((state) => ({ products: state.products.filter((product) => product.id !== id) })),
    updateProduct: (id, product) => set((state) => ({ products: state.products.map((p) => (p.id === id ? product : p)) })),
    clearProducts: () => set(() => ({ products: [] })),
    setProducts: (products) => set(() => ({ products })),

    collections: [],
    addCollection: (collection) => set((state) => ({ collections: [...state.collections, collection] })),
    removeCollection: (id) => set((state) => ({ collections: state.collections.filter((collection) => collection.id !== id) })),
    updateCollection: (id, collection) => set((state) => ({ collections: state.collections.map((c) => (c.id === id ? collection : c)) })),
    clearCollections: () => set(() => ({ collections: [] })),
    setCollections: (collections) => set(() => ({ collections })),

    categories: [],
    setCategories: (categories) => set(() => ({ categories })),

    brands: [],
    setBrands: (brands) => set(() => ({ brands })),
}));
