import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { Search, Gem, CircleDollarSign, Sparkles, Palette } from "lucide-react";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Tabs, TabsList, TabsTrigger } from "../components/ui/tabs";
import { toast } from "sonner";
import { useAuth, apiCall, API } from "../context/AuthContext";
import { BottomNav, TopHeader } from "../components/Navigation";
import { ProductCard } from "../components/Cards";

function StorePage() {
  const [activeTab, setActiveTab] = useState("jewelry");
  const [merchants, setMerchants] = useState([]);
  const [designers, setDesigners] = useState([]);
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

  const designerCategories = [
    { id: "all", label: "الكل", icon: Palette },
    { id: "خواتم", label: "الخواتم", icon: CircleDollarSign },
    { id: "سلاسل", label: "السلاسل", icon: Sparkles },
    { id: "أساور", label: "الأساور", icon: CircleDollarSign },
    { id: "أقراط", label: "الأقراط", icon: Sparkles },
    { id: "أطقم", label: "الأطقم", icon: Gem },
  ];

  useEffect(() => {
    fetchData();
  }, [activeTab]);

  const fetchData = async () => {
    setLoading(true);
    setSelectedCategory("all");
    try {
      if (activeTab === "jewelry") {
        const [merchantsRes, productsRes] = await Promise.all([
          axios.get(`${API}/merchants`),
          axios.get(`${API}/products?type=jewelry`)
        ]);
        setMerchants(merchantsRes.data);
        setProducts(productsRes.data);
      } else {
        const [designersRes, productsRes] = await Promise.all([
          axios.get(`${API}/designers`),
          axios.get(`${API}/products?type=designer`)
        ]);
        setDesigners(designersRes.data);
        setProducts(productsRes.data);
      }
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
    const matchesSearch = !searchQuery || p.title.includes(searchQuery) || 
      (p.designer_name && p.designer_name.includes(searchQuery)) ||
      (p.brand && p.brand.includes(searchQuery));
    return matchesCategory && matchesSearch;
  });

  const currentCategories = activeTab === "jewelry" ? jewelryCategories : designerCategories;

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
            placeholder={activeTab === "jewelry" ? "ابحث عن مجوهرات أو متاجر..." : "ابحث عن مصممة أو تصميم..."}
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
            <TabsTrigger value="designer" className="flex-1 data-[state=active]:bg-[#D4AF37] data-[state=active]:text-black" data-testid="tab-designer">
              المصممات القطريات
            </TabsTrigger>
          </TabsList>
        </Tabs>
      </div>

      {/* Merchants or Designers */}
      <div className="px-4 py-4">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-lg font-bold text-white font-['Cairo']">
            {activeTab === "jewelry" ? "المحلات الموثوقة" : "المصممات القطريات"}
          </h3>
          <button className="text-[#D4AF37] text-sm">عرض الكل</button>
        </div>
        <div className="flex gap-4 overflow-x-auto hide-scrollbar pb-2">
          {activeTab === "jewelry" ? (
            merchants.map((m) => (
              <div key={m.merchant_id} className="flex flex-col items-center gap-2 min-w-[80px]" data-testid={`merchant-${m.merchant_id}`}>
                <div className="w-16 h-16 rounded-full border-2 border-[#D4AF37]/30 overflow-hidden">
                  <img src={m.logo_url} alt={m.name} className="w-full h-full object-cover" />
                </div>
                <span className="text-white text-xs text-center line-clamp-1">{m.name}</span>
              </div>
            ))
          ) : (
            designers.map((d) => (
              <div key={d.designer_id} className="flex flex-col items-center gap-2 min-w-[90px]" data-testid={`designer-${d.designer_id}`}>
                <div className="w-16 h-16 rounded-full border-2 border-[#D4AF37]/30 overflow-hidden bg-[#1A1A1A]">
                  <img src={d.logo_url} alt={d.name} className="w-full h-full object-cover" />
                </div>
                <span className="text-white text-xs text-center line-clamp-1">{d.name}</span>
                <span className="text-[#D4AF37] text-[10px] text-center line-clamp-1">{d.brand}</span>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Categories */}
      <div className="px-4 py-2">
        <h3 className="text-lg font-bold text-white font-['Cairo'] mb-3">
          {activeTab === "jewelry" ? "تصنيفات المصوغات" : "تصنيفات التصاميم"}
        </h3>
        <div className="flex gap-3 overflow-x-auto hide-scrollbar">
          {currentCategories.map((cat) => (
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

      {/* Products */}
      <div className="px-4 py-4">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-lg font-bold text-white font-['Cairo']">
            {activeTab === "jewelry" ? "المجوهرات المختارة" : "تصاميم المصممات"}
          </h3>
          <span className="text-[#A1A1AA] text-sm">{filteredProducts.length} منتج</span>
        </div>
        
        {loading ? (
          <div className="grid grid-cols-2 gap-3">
            {[1, 2, 3, 4].map(i => <div key={i} className="skeleton aspect-square rounded-xl" />)}
          </div>
        ) : filteredProducts.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-[#A1A1AA]">لا توجد منتجات</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-3">
            {filteredProducts.map((product) => (
              <DesignerProductCard 
                key={product.product_id} 
                product={product} 
                onAddToCart={handleAddToCart}
                isDesigner={activeTab === "designer"}
              />
            ))}
          </div>
        )}
      </div>

      <BottomNav />
    </div>
  );
}

// Enhanced Product Card for Designer Products
function DesignerProductCard({ product, onAddToCart, isDesigner }) {
  const [isFavorite, setIsFavorite] = useState(false);
  const { Heart, Plus } = require("lucide-react");
  const { Badge } = require("../components/ui/badge");
  const { Button } = require("../components/ui/button");

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
        {isDesigner ? (
          <>
            <span className="text-[#D4AF37] text-xs">{product.designer_name}</span>
            <p className="text-[#A1A1AA] text-[10px]">{product.brand}</p>
          </>
        ) : (
          product.merchant_name && (
            <span className="text-[#D4AF37] text-xs">{product.merchant_name}</span>
          )
        )}
        <h3 className="text-white font-semibold text-sm mt-1 line-clamp-1">{product.title}</h3>
        {product.weight_grams && (
          <p className="text-[#A1A1AA] text-xs">{product.weight_grams} جرام</p>
        )}
        <div className="flex items-center justify-between mt-2">
          <span className="text-[#D4AF37] font-bold">{product.price_qar?.toLocaleString()} ر.ق</span>
          <Button
            size="sm"
            onClick={(e) => { e.stopPropagation(); onAddToCart?.(product); }}
            className="bg-[#D4AF37] hover:bg-[#F4C430] text-black h-8 px-3 rounded-full flex items-center gap-1"
            data-testid="add-to-cart-btn"
          >
            <Plus size={16} />
            <span className="text-xs font-bold">أضف</span>
          </Button>
        </div>
      </div>
    </div>
  );
}

export default StorePage;
