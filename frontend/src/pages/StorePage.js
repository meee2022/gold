import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { Search, Gem, CircleDollarSign, Sparkles } from "lucide-react";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Tabs, TabsList, TabsTrigger } from "../components/ui/tabs";
import { toast } from "sonner";
import { useAuth, apiCall, API } from "../context/AuthContext";
import { BottomNav, TopHeader } from "../components/Navigation";
import { ProductCard } from "../components/Cards";

const StorePage = () => {
  const [activeTab, setActiveTab] = useState("jewelry");
  const [merchants, setMerchants] = useState([]);
  const [products, setProducts] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const navigate = useNavigate();
  const { user } = useAuth();

  const jewelryCategories = [
    { id: "all", label: "الكل", icon: Gem },
    { id: "خواتم", label: "الخواتم", icon: CircleDollarSign },
    { id: "سلاسل", label: "السلاسل", icon: Sparkles },
    { id: "أساور", label: "الأساور", icon: CircleDollarSign },
    { id: "أقراط", label: "الأقراط", icon: Sparkles },
  ];

  useEffect(() => {
    fetchData();
  }, [activeTab]);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [merchantsRes, productsRes] = await Promise.all([
        axios.get(`${API}/merchants`),
        axios.get(`${API}/products?type=${activeTab}`)
      ]);
      setMerchants(merchantsRes.data);
      setProducts(productsRes.data);
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

  const filteredProducts = products.filter(p => {
    const matchesCategory = selectedCategory === "all" || p.category === selectedCategory;
    const matchesSearch = !searchQuery || p.title.includes(searchQuery);
    return matchesCategory && matchesSearch;
  });

  return (
    <div className="min-h-screen bg-[#050505] pb-20" data-testid="store-page">
      <TopHeader title="المتجر" />

      {/* Search */}
      <div className="px-4 py-3">
        <div className="relative">
          <Search className="absolute right-3 top-1/2 -translate-y-1/2 text-[#A1A1AA]" size={20} />
          <Input
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="ابحث عن مجوهرات أو متاجر..."
            className="bg-[#1A1A1A] border-[#27272A] text-white pr-10 h-12 rounded-full"
            data-testid="search-input"
          />
        </div>
      </div>

      {/* Tabs */}
      <div className="px-4">
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="bg-[#121212] border border-[#27272A] w-full">
            <TabsTrigger value="jewelry" className="flex-1 data-[state=active]:bg-[#D4AF37] data-[state=active]:text-black" data-testid="tab-jewelry">
              المجوهرات
            </TabsTrigger>
            <TabsTrigger value="qatari" className="flex-1 data-[state=active]:bg-[#D4AF37] data-[state=active]:text-black" data-testid="tab-qatari">
              المنتجات القطرية
            </TabsTrigger>
          </TabsList>
        </Tabs>
      </div>

      {/* Trusted Merchants */}
      <div className="px-4 py-4">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-lg font-bold text-white font-['Cairo']">المحلات الموثوقة</h3>
          <button className="text-[#D4AF37] text-sm">عرض الكل</button>
        </div>
        <div className="flex gap-4 overflow-x-auto hide-scrollbar">
          {merchants.map((m) => (
            <div key={m.merchant_id} className="flex flex-col items-center gap-2 min-w-[70px]" data-testid={`merchant-${m.merchant_id}`}>
              <div className="w-16 h-16 rounded-full border-2 border-[#D4AF37]/30 overflow-hidden">
                <img src={m.logo_url} alt={m.name} className="w-full h-full object-cover" />
              </div>
              <span className="text-white text-xs text-center">{m.name}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Categories - Only for Jewelry */}
      {activeTab === "jewelry" && (
        <div className="px-4 py-2">
          <h3 className="text-lg font-bold text-white font-['Cairo'] mb-3">تصنيفات المصوغات</h3>
          <div className="flex gap-3 overflow-x-auto hide-scrollbar">
            {jewelryCategories.map((cat) => (
              <button
                key={cat.id}
                onClick={() => setSelectedCategory(cat.id)}
                className={`flex flex-col items-center gap-2 min-w-[70px] p-3 rounded-xl transition-colors ${selectedCategory === cat.id ? "bg-[#D4AF37] text-black" : "bg-[#121212] border border-[#27272A] text-[#A1A1AA]"}`}
                data-testid={`cat-${cat.id}`}
              >
                <cat.icon size={24} />
                <span className="text-xs">{cat.label}</span>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Products */}
      <div className="px-4 py-4">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-lg font-bold text-white font-['Cairo']">
            {activeTab === "jewelry" ? "المجوهرات المختارة" : "المنتجات القطرية"}
          </h3>
        </div>
        
        {loading ? (
          <div className="grid grid-cols-2 gap-3">
            {[1, 2, 3, 4].map(i => <div key={i} className="skeleton aspect-square rounded-xl" />)}
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-3">
            {filteredProducts.map((product) => (
              <ProductCard key={product.product_id} product={product} onAddToCart={handleAddToCart} />
            ))}
          </div>
        )}
      </div>

      <BottomNav />
    </div>
  );
};

export default StorePage;
