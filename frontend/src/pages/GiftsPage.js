import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { X, Check } from "lucide-react";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { toast } from "sonner";
import { useAuth, apiCall, API } from "../context/AuthContext";
import { BottomNav, TopHeader } from "../components/Navigation";

const GiftsPage = () => {
  const [products, setProducts] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [selectedCard, setSelectedCard] = useState(null);
  const [customMessage, setCustomMessage] = useState("");
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const { user } = useAuth();

  const categories = [
    { id: "all", label: "الكل", icon: "💝" },
    { id: "أعراس", label: "الأعراس", icon: "💍" },
    { id: "مواليد", label: "المواليد", icon: "👶" },
    { id: "نجاح", label: "النجاح", icon: "🎓" },
  ];

  const greetings = [
    "دامت أفراحكم",
    "مبارك ما رزقتم",
    "تستحق كل خير",
    "بارك الله لكما",
    "ألف مبروك"
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

  const handleAddToCart = async (product) => {
    if (!user) {
      navigate("/auth");
      return;
    }
    try {
      await apiCall("post", "/cart/add", { product_id: product.product_id, quantity: 1 });
      toast.success("تمت الإضافة للسلة");
      setSelectedCard(null);
    } catch (error) {
      toast.error("فشل في الإضافة");
    }
  };

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
        <p className="text-[#A1A1AA] text-sm mb-4">اختر نوع المناسبة لتصفح التصاميم</p>
        <div className="grid grid-cols-2 gap-3">
          {filteredProducts.map((product) => (
            <div 
              key={product.product_id}
              onClick={() => setSelectedCard(product)}
              className="bg-[#121212] border border-[#27272A] rounded-xl overflow-hidden cursor-pointer hover:border-[#D4AF37]/50 transition-colors"
              data-testid={`gift-${product.product_id}`}
            >
              <div className="aspect-square relative">
                <img src={product.image_url} alt={product.title} className="w-full h-full object-cover" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                <div className="absolute bottom-2 right-2 left-2">
                  <p className="text-white font-semibold text-sm">{product.title}</p>
                  <p className="text-[#D4AF37] font-bold">{product.price_qar?.toLocaleString()} ر.ق</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Gift Card Selection Modal */}
      {selectedCard && (
        <div className="fixed inset-0 bg-black/80 z-50 flex items-end justify-center" onClick={() => setSelectedCard(null)}>
          <div 
            className="bg-[#0A0A0A] w-full max-w-md rounded-t-3xl p-6 max-h-[80vh] overflow-y-auto"
            onClick={e => e.stopPropagation()}
            data-testid="gift-modal"
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold text-white font-['Cairo']">اختيار عبارة التهنئة</h3>
              <button onClick={() => setSelectedCard(null)} className="p-2">
                <X className="text-[#A1A1AA]" />
              </button>
            </div>

            {/* Card Preview */}
            <div className="relative rounded-xl overflow-hidden mb-4 border border-[#D4AF37]/30">
              <img src={selectedCard.image_url} alt="" className="w-full aspect-video object-cover opacity-60" />
              <div className="absolute inset-0 flex items-center justify-center bg-black/40">
                <div className="text-center p-4">
                  <p className="text-[#D4AF37] font-bold text-xl font-['Cairo']">{customMessage || "بارك الله لكما"}</p>
                  <p className="text-white/80 text-sm mt-2">{selectedCard.title}</p>
                </div>
              </div>
            </div>

            {/* Custom Message Input */}
            <div className="mb-4">
              <label className="text-white text-sm mb-2 block">أو اكتب رسالتك الخاصة</label>
              <Input
                value={customMessage}
                onChange={(e) => setCustomMessage(e.target.value)}
                placeholder="اكتب تهنئتك الخاصة هنا لتمتزج بلمعان الذهب..."
                className="bg-[#1A1A1A] border-[#27272A] text-white text-right"
                data-testid="custom-message-input"
              />
            </div>

            {/* Quick Greetings */}
            <div className="mb-4">
              <p className="text-[#A1A1AA] text-sm mb-2">مقترحات سريعة</p>
              <div className="flex flex-wrap gap-2">
                {greetings.map((g) => (
                  <Button
                    key={g}
                    variant="outline"
                    size="sm"
                    onClick={() => setCustomMessage(g)}
                    className="border-[#27272A] text-[#A1A1AA] hover:border-[#D4AF37] hover:text-[#D4AF37] rounded-full"
                    data-testid={`greeting-${g}`}
                  >
                    {g}
                  </Button>
                ))}
              </div>
            </div>

            {/* Add to Cart */}
            <Button 
              onClick={() => handleAddToCart(selectedCard)}
              className="w-full bg-[#D4AF37] hover:bg-[#F4C430] text-black font-bold rounded-full h-12"
              data-testid="confirm-gift-btn"
            >
              <Check className="ml-2" />
              تأكيد الاختيار
            </Button>
          </div>
        </div>
      )}

      <BottomNav />
    </div>
  );
};

export default GiftsPage;
