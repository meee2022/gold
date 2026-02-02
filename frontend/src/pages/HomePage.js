import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { TrendingUp, Gift, Gem } from "lucide-react";
import { Button } from "../components/ui/button";
import { toast } from "sonner";
import { useAuth, apiCall, API } from "../context/AuthContext";
import { BottomNav, TopHeader } from "../components/Navigation";
import { PriceCard, ProductCard } from "../components/Cards";

const HomePage = () => {
  const [prices, setPrices] = useState([]);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const { user } = useAuth();

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [pricesRes, productsRes] = await Promise.all([
        axios.get(`${API}/gold-prices`),
        axios.get(`${API}/products?type=jewelry`)
      ]);
      setPrices(pricesRes.data);
      setProducts(productsRes.data.slice(0, 4));
    } catch (error) {
      console.error(error);
    }
    setLoading(false);
  };

  const handleAddToCart = async (product) => {
    if (!user) {
      navigate("/auth");
      return;
    }
    try {
      await apiCall("post", "/cart/add", { product_id: product.product_id, quantity: 1 });
      toast.success("تمت الإضافة للسلة");
    } catch (error) {
      toast.error("فشل في الإضافة");
    }
  };

  const quickAccess = [
    { label: "الاستثمار", sublabel: "سبائك وعملات", icon: TrendingUp, path: "/investment" },
    { label: "المجوهرات", sublabel: "أطقم فاخرة", icon: Gem, path: "/store" },
    { label: "الهدايا", sublabel: "هدايا ذهبية", icon: Gift, path: "/gifts" },
  ];

  if (loading) {
    return (
      <div className="min-h-screen bg-[#050505] pb-20">
        <TopHeader />
        <div className="p-4 space-y-4">
          {[1, 2, 3].map(i => (
            <div key={i} className="skeleton h-24 rounded-xl" />
          ))}
        </div>
        <BottomNav />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#050505] pb-20" data-testid="home-page">
      <TopHeader />
      
      {/* Live Prices */}
      <div className="px-4 py-3">
        <div className="flex gap-3 overflow-x-auto hide-scrollbar pb-2">
          {prices.map((p) => (
            <PriceCard 
              key={p.karat} 
              karat={p.karat} 
              price={p.price_per_gram_qar} 
              change={p.change_amount}
              changePercent={p.change_percent}
            />
          ))}
        </div>
      </div>

      {/* Hero Banner */}
      <div className="px-4 py-2">
        <div className="relative rounded-2xl overflow-hidden h-44 bg-gradient-to-br from-[#1A1A1A] to-[#0A0A0A] border border-[#27272A]" data-testid="hero-banner">
          <img 
            src="https://images.unsplash.com/photo-1624365169364-0640dd10e180?w=800" 
            alt="Gold" 
            className="absolute inset-0 w-full h-full object-cover opacity-40"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent" />
          <div className="absolute bottom-0 right-0 p-5 text-right">
            <h2 className="text-2xl font-bold text-[#D4AF37] font-['Cairo'] mb-1">زينة وخزينة</h2>
            <p className="text-[#A1A1AA] text-sm mb-3">منصة قطرية لتجارة الذهب بكل أمان وسهولة</p>
            <Button 
              onClick={() => navigate("/investment")}
              className="bg-[#D4AF37] hover:bg-[#F4C430] text-black font-bold rounded-full px-6 gold-glow"
              data-testid="start-investment-btn"
            >
              ابدأ الاستثمار
            </Button>
          </div>
        </div>
      </div>

      {/* Quick Access */}
      <div className="px-4 py-4">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-lg font-bold text-white font-['Cairo']">الوصول السريع</h3>
          <button className="text-[#D4AF37] text-sm">عرض الكل</button>
        </div>
        <div className="flex gap-3 overflow-x-auto hide-scrollbar">
          {quickAccess.map((item) => (
            <button
              key={item.path}
              onClick={() => navigate(item.path)}
              className="flex flex-col items-center gap-2 min-w-[100px] p-4 bg-[#121212] border border-[#27272A] rounded-xl hover:border-[#D4AF37]/50 transition-colors"
              data-testid={`quick-${item.label}`}
            >
              <div className="w-12 h-12 rounded-full bg-[#D4AF37]/10 flex items-center justify-center">
                <item.icon size={24} className="text-[#D4AF37]" />
              </div>
              <span className="text-white text-sm font-medium">{item.label}</span>
              <span className="text-[#A1A1AA] text-xs">{item.sublabel}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Market Updates */}
      <div className="px-4 py-4">
        <h3 className="text-lg font-bold text-white font-['Cairo'] mb-3">آخر تحديثات السوق</h3>
        <div className="space-y-2">
          {prices.slice(0, 3).map((p) => (
            <div key={p.karat} className="flex items-center justify-between p-3 bg-[#121212] border border-[#27272A] rounded-xl">
              <div className="flex items-center gap-3">
                <div className="w-2 h-2 rounded-full bg-green-500 pulse-live" />
                <span className="text-white">ذهب عيار {p.karat}</span>
              </div>
              <div className="text-left">
                <span className="text-white font-bold">{p.price_per_gram_qar?.toFixed(2)} ر.ق</span>
                <span className={`text-sm mr-2 ${p.change_amount >= 0 ? "text-green-500" : "text-red-500"}`}>
                  {p.change_amount >= 0 ? "+" : ""}{p.change_amount}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Featured Products */}
      {products.length > 0 && (
        <div className="px-4 py-4">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-lg font-bold text-white font-['Cairo']">منتجات مميزة</h3>
            <button onClick={() => navigate("/store")} className="text-[#D4AF37] text-sm">عرض الكل</button>
          </div>
          <div className="grid grid-cols-2 gap-3">
            {products.map((product) => (
              <ProductCard key={product.product_id} product={product} onAddToCart={handleAddToCart} />
            ))}
          </div>
        </div>
      )}

      <BottomNav />
    </div>
  );
};

export default HomePage;
