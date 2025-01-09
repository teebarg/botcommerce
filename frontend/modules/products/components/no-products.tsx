import { Home, PackageSearch, RefreshCcw } from "nui-react-icons";
import React from "react";

const NoProductsFound = ({
    searchQuery = "",
    onClearSearch = () => {},
    onGoHome = () => {},
    suggestedCategories = ["Electronics", "Clothing", "Home & Garden", "Books"],
}) => {
    return (
        <div className="min-h-[400px] w-full flex flex-col items-center justify-center px-4 py-12">
            {/* Icon Animation Container */}
            <div className="relative mb-6">
                <div className="absolute inset-0 bg-blue-100 rounded-full opacity-20 animate-ping" />
                <div className="relative">
                    <PackageSearch className="w-20 h-20 text-blue-600" strokeWidth={1.5} />
                </div>
            </div>

            {/* Main Content */}
            <div className="text-center max-w-md mx-auto">
                <h2 className="text-2xl font-bold text-default-900 mb-3">No Products Found</h2>

                {searchQuery && (
                    <p className="text-default-500 mb-2">
                        {`We couldn't find any products matching`}
                        <span className="font-medium text-default-900 mx-1">{`"${searchQuery}"`}</span>
                    </p>
                )}

                <p className="text-default-500 mb-8">Try adjusting your search or browse our suggested categories below.</p>

                {/* Action Buttons */}
                <div className="flex flex-wrap justify-center gap-3 mb-8">
                    <button
                        aria-label="clear search"
                        className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg
                     hover:bg-blue-700 transition-colors duration-200 gap-2"
                        onClick={onClearSearch}
                    >
                        <RefreshCcw className="w-4 h-4" />
                        Clear Search
                    </button>

                    <button
                        aria-label="home"
                        className="inline-flex items-center px-4 py-2 border border-gray-300 text-default-500
                     rounded-lg hover:bg-gray-50 transition-colors duration-200 gap-2"
                        onClick={onGoHome}
                    >
                        <Home className="w-4 h-4" />
                        Go to Homepage
                    </button>
                </div>

                {/* Suggested Categories */}
                <div className="space-y-4">
                    <h3 className="text-sm font-semibold text-default-900">Popular Categories</h3>

                    <div className="flex flex-wrap justify-center gap-2">
                        {suggestedCategories.map((category) => (
                            <button
                                aria-label="categories"
                                key={category}
                                className="px-4 py-2 bg-default-100 text-default-900 rounded-full text-sm
                         hover:bg-gray-200 transition-colors duration-200"
                            >
                                {category}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Search Tips */}
                <div className="mt-8 pt-6 border-t border-default-100">
                    <h3 className="text-sm font-semibold text-default-900 mb-3">Search Tips</h3>
                    <ul className="text-sm text-default-500 space-y-2">
                        <li>• Check for spelling mistakes</li>
                        <li>• Try using more general keywords</li>
                        <li>• Browse by category instead</li>
                        <li>• Consider similar terms</li>
                    </ul>
                </div>
            </div>
        </div>
    );
};

export default NoProductsFound;
