import { Heart } from "nui-react-icons";
import { ShoppingCart } from "nui-react-icons";
import { Star } from "lucide-react";

import { ProductSearch } from "@/schemas/product";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

const PCard: React.FC<{ product: ProductSearch }> = ({ product }) => {
    const discount = ((product.old_price - product.price) / product.old_price) * 100;

    return (
        <Card
            key={product.id}
            className="group overflow-hidden hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2 border-0 shadow-lg"
        >
            <div className="relative bg-content3">
                <img
                    alt={product.name}
                    className="w-full h-72 object-cover group-hover:scale-110 transition-transform duration-500"
                    src={product.image}
                />
                {discount > 0 && (
                    <div className="absolute top-3 left-3 bg-red-500 text-white px-3 py-1 rounded-full text-xs font-bold shadow-lg">{discount}%</div>
                )}
                <button className="absolute top-3 right-3 p-2 bg-white/90 backdrop-blur-sm rounded-full shadow-lg opacity-0 group-hover:opacity-100 transition-all duration-300 hover:bg-white hover:scale-110">
                    <Heart className="h-4 w-4 text-gray-600 hover:text-red-500 transition-colors" />
                </button>
            </div>

            <div className="p-4">
                <div className="flex items-center mb-2">
                    <div className="flex items-center">
                        <Star className="h-4 w-4 text-yellow-400 fill-current" />
                        <span className="text-sm text-default-600 ml-1">{product.average_rating}</span>
                    </div>
                </div>

                <h3 className="font-semibold text-default-900 mb-2 group-hover:text-purple-600 transition-colors line-clamp-2">{product.name}</h3>

                <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center space-x-2">
                        <span className="text-xl font-bold text-purple-600">{product.price}</span>
                        <span className="text-sm text-default-500 line-through">{product.old_price}</span>
                    </div>
                </div>

                <Button className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white font-medium py-3 rounded-xl transition-all duration-300 transform hover:scale-105 shadow-lg">
                    <ShoppingCart className="h-4 w-4 mr-2" />
                    Add to Cart
                </Button>
            </div>
        </Card>
    );
};

export default PCard;
