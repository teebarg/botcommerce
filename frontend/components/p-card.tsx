import { ProductSearch } from "@/schemas/product";
import { Card } from "@/components/ui/card";
import { Heart } from "nui-react-icons";
import { Button } from "@/components/ui/button";
import { ShoppingCart } from "nui-react-icons";

const PCard: React.FC<{ product: ProductSearch }> = ({ product }) => {
    const discount = ((product.old_price - product.price) / product.old_price) * 100;
    return (
        <Card key={product.id} className="group overflow-hidden hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
            <div className="relative">
                <img
                    src={product.image}
                    alt={product.name}
                    className="w-full h-64 object-cover group-hover:scale-105 transition-transform duration-300"
                />
                <div className="absolute top-3 left-3 bg-red-500 text-white px-2 py-1 rounded-full text-xs font-bold">{discount}</div>
                <button className="absolute top-3 right-3 p-2 bg-white rounded-full shadow-md opacity-0 group-hover:opacity-100 transition-opacity duration-300 hover:bg-red-50">
                    <Heart className="h-4 w-4 text-gray-600 hover:text-red-500" />
                </button>
            </div>

            <div className="p-4">
                <h3 className="font-semibold text-gray-900 mb-2 group-hover:text-purple-600 transition-colors">{product.name}</h3>
                <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center space-x-2">
                        <span className="text-2xl font-bold text-purple-600">{product.price}</span>
                        <span className="text-sm text-gray-500 line-through">{product.old_price}</span>
                    </div>
                </div>
                <Button className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white font-medium py-2 rounded-lg transition-all duration-300">
                    <ShoppingCart className="h-4 w-4 mr-2" />
                    Add to Cart
                </Button>
            </div>
        </Card>
    );
};

export default PCard;
