import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Heart, Plus, ArrowUp, ArrowDown } from "lucide-react";
import { Button } from "./ui/button";
import { Badge } from "./ui/badge";

// Price Card Component
export const PriceCard = ({ karat, price, change, changePercent, isLive = true }) => {
  const isPositive = change >= 0;
  return (
    <div className="bg-[#121212] border border-[#27272A] rounded-xl p-3 min-w-[140px] flex-shrink-0" data-testid={`price-card-${karat}`}>
      <div className="flex items-center justify-between mb-2">
        <span className="text-[#A1A1AA] text-sm">عيار {karat} (ر.ق)</span>
        {isLive && <div className="w-2 h-2 rounded-full bg-green-500 pulse-live" />}
      </div>
      <div className="text-xl font-bold text-white">{price?.toFixed(2)}</div>
      <div className={`flex items-center gap-1 text-sm ${isPositive ? "text-green-500" : "text-red-500"}`}>
        {isPositive ? <ArrowUp size={14} /> : <ArrowDown size={14} />}
        <span>{isPositive ? "+" : ""}{changePercent?.toFixed(1)}%</span>
      </div>
    </div>
  );
};

// Product Card Component
export const ProductCard = ({ product, onAddToCart }) => {
  const navigate = useNavigate();
  const [isFavorite, setIsFavorite] = useState(false);

  return (
    <div className="bg-[#121212] border border-[#27272A] rounded-xl overflow-hidden card-hover" data-testid={`product-${product.product_id}`}>
      <div className="relative aspect-square">
        <img src={product.image_url} alt={product.title} className="w-full h-full object-cover" />
        <button 
          onClick={(e) => { e.stopPropagation(); setIsFavorite(!isFavorite); }}
          className="absolute top-2 left-2 w-8 h-8 rounded-full bg-black/50 flex items-center justify-center"
          data-testid="favorite-btn"
        >
          <Heart size={16} className={isFavorite ? "fill-[#D4AF37] text-[#D4AF37]" : "text-white"} />
        </button>
        {product.karat && (
          <Badge className="absolute bottom-2 right-2 bg-[#D4AF37] text-black font-bold">
            عيار {product.karat}
          </Badge>
        )}
      </div>
      <div className="p-3">
        {product.merchant_name && (
          <span className="text-[#D4AF37] text-xs">{product.merchant_name}</span>
        )}
        <h3 className="text-white font-semibold text-sm mt-1 line-clamp-1">{product.title}</h3>
        <div className="flex items-center justify-between mt-2">
          <span className="text-[#D4AF37] font-bold">{product.price_qar?.toLocaleString()} ر.ق</span>
          <Button
            size="sm"
            onClick={(e) => { e.stopPropagation(); onAddToCart?.(product); }}
            className="bg-[#D4AF37] hover:bg-[#F4C430] text-black h-8 px-3 rounded-full"
            data-testid="add-to-cart-btn"
          >
            <Plus size={16} />
          </Button>
        </div>
      </div>
    </div>
  );
};
