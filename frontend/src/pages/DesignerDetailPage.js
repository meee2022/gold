import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import axios from "axios";
import { ChevronLeft, MapPin, Phone, Instagram, Heart, Plus } from "lucide-react";
import { Button } from "../components/ui/button";
import { Badge } from "../components/ui/badge";
import { toast } from "sonner";
import { useAuth, apiCall, API } from "../context/AuthContext";
import { BottomNav } from "../components/Navigation";

function DesignerDetailPage() {
  const { designerId } = useParams();
  const [designer, setDesigner] = useState(null);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const { user } = useAuth();

  useEffect(() => {
    fetchDesignerData();
  }, [designerId]);

  const fetchDesignerData = async () => {
    try {
      const [designersRes, productsRes] = await Promise.all([
        axios.get(`${API}/designers`),
        axios.get(`${API}/products?type=designer`)
      ]);
      
      const foundDesigner = designersRes.data.find(d => d.designer_id === designerId);
      setDesigner(foundDesigner);
      
      // Filter products by this designer
      const designerProducts = productsRes.data.filter(p => 
        p.designer_name === foundDesigner?.name
      );
      setProducts(designerProducts);
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

  if (loading) {
    return (
      <div className="min-h-screen bg-[#050505] pb-20">
        <div className="p-4 space-y-4">
          <div className="skeleton h-48 rounded-xl" />
          <div className="skeleton h-24 rounded-xl" />
          {[1, 2].map(i => <div key={i} className="skeleton h-32 rounded-xl" />)}
        </div>
        <BottomNav />
      </div>
    );
  }

  if (!designer) {
    return (
      <div className="min-h-screen bg-[#050505] pb-20">
        <div className="flex flex-col items-center justify-center h-[60vh]">
          <p className="text-[#A1A1AA]">المصممة غير موجودة</p>
          <Button onClick={() => navigate("/designers")} className="mt-4 bg-[#D4AF37] text-black rounded-full">
            العودة للمصممات
          </Button>
        </div>
        <BottomNav />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#050505] pb-20" data-testid="designer-detail-page">
      {/* Header */}
      <div className="sticky top-0 z-40 bg-[#0A0A0A]/90 backdrop-blur-md border-b border-[#27272A] px-4 py-3 flex items-center gap-3">
        <button onClick={() => navigate(-1)} className="p-2 rounded-full hover:bg-[#1A1A1A] transition-colors">
          <ChevronLeft size={24} className="text-[#D4AF37] flip-rtl" />
        </button>
        <h1 className="text-lg font-bold text-[#D4AF37] font-['Cairo']">{designer.name}</h1>
      </div>

      {/* Designer Profile Card */}
      <div className="px-4 py-4">
        <div className="bg-gradient-to-br from-[#1A1A1A] to-[#0A0A0A] border border-[#27272A] rounded-2xl overflow-hidden">
          {/* Cover Image */}
          <div className="h-32 bg-gradient-to-r from-[#D4AF37]/20 to-[#D4AF37]/5 relative">
            <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?w=800')] bg-cover bg-center opacity-30" />
          </div>
          
          {/* Profile Info */}
          <div className="px-4 pb-4 -mt-12 relative">
            <div className="w-24 h-24 rounded-full border-4 border-[#0A0A0A] overflow-hidden bg-[#1A1A1A]">
              <img src={designer.logo_url} alt={designer.name} className="w-full h-full object-cover" />
            </div>
            
            <div className="mt-3">
              <h2 className="text-xl font-bold text-white font-['Cairo']">{designer.name}</h2>
              <p className="text-[#D4AF37] font-semibold">{designer.brand}</p>
              <p className="text-[#A1A1AA] text-sm mt-1">{designer.specialty}</p>
            </div>

            {/* Stats */}
            <div className="flex gap-6 mt-4 py-3 border-t border-[#27272A]">
              <div className="text-center">
                <p className="text-xl font-bold text-[#D4AF37]">{products.length}</p>
                <p className="text-[#A1A1AA] text-xs">تصميم</p>
              </div>
              <div className="text-center">
                <p className="text-xl font-bold text-[#D4AF37]">⭐ 4.9</p>
                <p className="text-[#A1A1AA] text-xs">التقييم</p>
              </div>
              <div className="text-center">
                <p className="text-xl font-bold text-[#D4AF37]">قطر</p>
                <p className="text-[#A1A1AA] text-xs">الموقع</p>
              </div>
            </div>

            {/* About */}
            <div className="mt-4 p-3 bg-[#0A0A0A] rounded-xl">
              <h3 className="text-white font-bold mb-2 font-['Cairo']">عن المصممة</h3>
              <p className="text-[#A1A1AA] text-sm leading-relaxed">
                مصممة مجوهرات قطرية متخصصة في {designer.specialty}. تجمع تصاميمها بين الأصالة القطرية والذوق العصري، 
                مستوحاة من التراث الخليجي الأصيل مع لمسات عصرية تناسب المرأة العربية.
              </p>
            </div>

            {/* Contact Button */}
            <Button 
              className="w-full mt-4 bg-[#D4AF37] hover:bg-[#F4C430] text-black font-bold rounded-full h-12"
              data-testid="contact-designer"
            >
              <Instagram className="ml-2" size={18} />
              تواصل مع المصممة
            </Button>
          </div>
        </div>
      </div>

      {/* Products Section */}
      <div className="px-4 py-2">
        <h3 className="text-lg font-bold text-white font-['Cairo'] mb-4">تصاميم {designer.name} ({products.length})</h3>
        
        {products.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-[#A1A1AA]">لا توجد تصاميم حالياً</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-3">
            {products.map((product) => (
              <DesignerProductCard 
                key={product.product_id} 
                product={product} 
                onAddToCart={handleAddToCart}
              />
            ))}
          </div>
        )}
      </div>

      <BottomNav />
    </div>
  );
}

// Product Card Component
function DesignerProductCard({ product, onAddToCart }) {
  const [isFavorite, setIsFavorite] = useState(false);

  return (
    <div className="bg-[#121212] border border-[#27272A] rounded-xl overflow-hidden" data-testid={`product-${product.product_id}`}>
      <div className="relative aspect-square">
        <img src={product.image_url} alt={product.title} className="w-full h-full object-cover" />
        <button 
          onClick={(e) => { e.stopPropagation(); setIsFavorite(!isFavorite); }}
          className="absolute top-2 left-2 w-8 h-8 rounded-full bg-black/50 flex items-center justify-center"
        >
          <Heart size={16} className={isFavorite ? "fill-[#D4AF37] text-[#D4AF37]" : "text-white"} />
        </button>
        {product.karat && (
          <Badge className="absolute bottom-2 right-2 bg-[#D4AF37] text-black font-bold text-xs">
            عيار {product.karat}
          </Badge>
        )}
      </div>
      <div className="p-3">
        <h3 className="text-white font-semibold text-sm line-clamp-1">{product.title}</h3>
        {product.weight_grams && (
          <p className="text-[#A1A1AA] text-xs">{product.weight_grams} جرام</p>
        )}
        <div className="flex items-center justify-between mt-2">
          <span className="text-[#D4AF37] font-bold text-sm">{product.price_qar?.toLocaleString()} ر.ق</span>
          <Button
            size="sm"
            onClick={(e) => { e.stopPropagation(); onAddToCart?.(product); }}
            className="bg-[#D4AF37] hover:bg-[#F4C430] text-black h-7 px-2 rounded-full"
            data-testid="add-to-cart-btn"
          >
            <Plus size={14} />
          </Button>
        </div>
      </div>
    </div>
  );
}

export default DesignerDetailPage;
