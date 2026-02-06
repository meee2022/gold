import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { Gift } from "lucide-react";
import { Button } from "../components/ui/button";
import { toast } from "sonner";
import { useAuth, API } from "../context/AuthContext";
import { BottomNav, TopHeader } from "../components/Navigation";

const GiftsPage = () => {
  const [products, setProducts] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const { user } = useAuth();

  const categories = [
    { id: "all", label: "الكل", icon: "💝" },
    { id: "أعراس", label: "الأعراس", icon: "💍" },
    { id: "مواليد", label: "المواليد", icon: "👶" },
    { id: "نجاح", label: "النجاح", icon: "🎓" },
  ];

  useEffect(() => {
    fetchGifts();
  }, []);

  const fetchGifts = async () => {
    try {
      const response = await axios.get(`${API}/products?type=gift`);
      setProducts(response.data);
    } catch (error) {
      console.error(error);
    }
    setLoading(false);
  };

  const filteredProducts = selectedCategory === "all" 
    ? products 
    : products.filter(p => p.category === selectedCategory);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#050505] pb-20">
        <TopHeader title="الهدايا" />
        <div className="p-4 grid grid-cols-2 gap-3">
          {[1, 2, 3, 4].map(i => <div key={i} className="skeleton aspect-square rounded-xl" />)}
        </div>
        <BottomNav />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#050505] pb-20" data-testid="gifts-page">
      <TopHeader title="الهدايا" />

      {/* Categories */}
      <div className="px-4 py-3">
        <div className="flex gap-2 overflow-x-auto hide-scrollbar">
          {categories.map((cat) => (
            <Button
              key={cat.id}
              variant={selectedCategory === cat.id ? "default" : "outline"}
              onClick={() => setSelectedCategory(cat.id)}
              className={`rounded-full flex items-center gap-2 ${selectedCategory === cat.id ? "bg-[#D4AF37] text-black" : "border-[#27272A] text-[#A1A1AA]"}`}
              data-testid={`category-${cat.id}`}
            >
              <span>{cat.icon}</span>
              <span>{cat.label}</span>
            </Button>
          ))}
        </div>
      </div>

      {/* Gift Cards */}
      <div className="px-4 py-2">
        <h3 className="text-lg font-bold text-white font-['Cairo'] mb-3">مناسباتكم السعيدة</h3>
        <p className="text-[#A1A1AA] text-sm mb-4">اختر الهدية المناسبة وأرسلها لمن تحب</p>
        <div className="grid grid-cols-2 gap-3">
          {filteredProducts.map((product) => (
            <div 
              key={product.product_id}
              onClick={() => navigate(`/send-gift/${product.product_id}`)}
              className="bg-[#121212] border border-[#27272A] rounded-xl overflow-hidden cursor-pointer hover:border-[#D4AF37]/50 transition-all hover:scale-105"
              data-testid={`gift-${product.product_id}`}
            >
              <div className="aspect-square relative">
                <img src={product.image_url} alt={product.title} className="w-full h-full object-cover" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent" />
                <div className="absolute bottom-2 right-2 left-2">
                  <p className="text-white font-semibold text-sm">{product.title}</p>
                  <p className="text-[#D4AF37] font-bold">{product.price_qar?.toLocaleString()} ر.ق</p>
                </div>
                {/* Gift Icon */}
                <div className="absolute top-2 left-2 bg-[#D4AF37] rounded-full p-2">
                  <Gift size={16} className="text-black" />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      <BottomNav />
    </div>
  );
};

export default GiftsPage;
