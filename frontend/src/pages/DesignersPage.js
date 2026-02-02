import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { Search, ChevronLeft } from "lucide-react";
import { Input } from "../components/ui/input";
import { toast } from "sonner";
import { useAuth, apiCall, API } from "../context/AuthContext";
import { BottomNav, TopHeader } from "../components/Navigation";

function DesignersPage() {
  const [designers, setDesigners] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    fetchDesigners();
  }, []);

  const fetchDesigners = async () => {
    try {
      const response = await axios.get(`${API}/designers`);
      setDesigners(response.data);
    } catch (error) {
      console.error(error);
    }
    setLoading(false);
  };

  const filteredDesigners = designers.filter(d => {
    if (!searchQuery) return true;
    return d.name.includes(searchQuery) || d.brand.includes(searchQuery);
  });

  if (loading) {
    return (
      <div className="min-h-screen bg-[#050505] pb-20">
        <TopHeader title="المصممات القطريات" />
        <div className="p-4 space-y-4">
          {[1, 2, 3, 4].map(i => <div key={i} className="skeleton h-24 rounded-xl" />)}
        </div>
        <BottomNav />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#050505] pb-20" data-testid="designers-page">
      <TopHeader title="المصممات القطريات" />

      {/* Hero Section */}
      <div className="px-4 py-4">
        <div className="relative rounded-2xl overflow-hidden h-36 bg-gradient-to-br from-[#1A1A1A] to-[#0A0A0A] border border-[#27272A]">
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent" />
          <div className="absolute bottom-0 right-0 p-4 text-right">
            <h2 className="text-xl font-bold text-[#D4AF37] font-['Cairo'] mb-1">إبداعات قطرية</h2>
            <p className="text-[#A1A1AA] text-sm">تصاميم ذهب تراثية وعصرية من مصممات قطريات موهوبات</p>
          </div>
        </div>
      </div>

      {/* Search */}
      <div className="px-4 py-2">
        <div className="relative">
          <Search className="absolute right-3 top-1/2 -translate-y-1/2 text-[#A1A1AA]" size={20} />
          <Input
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="ابحث عن مصممة..."
            className="bg-[#1A1A1A] border-[#27272A] text-white pr-10 h-12 rounded-full"
            data-testid="search-designers"
          />
        </div>
      </div>

      {/* Designers List */}
      <div className="px-4 py-4">
        <h3 className="text-lg font-bold text-white font-['Cairo'] mb-4">المصممات ({filteredDesigners.length})</h3>
        <div className="space-y-3">
          {filteredDesigners.map((designer) => (
            <div 
              key={designer.designer_id}
              onClick={() => navigate(`/designers/${designer.designer_id}`)}
              className="flex items-center gap-4 p-4 bg-[#121212] border border-[#27272A] rounded-xl hover:border-[#D4AF37]/50 transition-all cursor-pointer"
              data-testid={`designer-card-${designer.designer_id}`}
            >
              <div className="w-16 h-16 rounded-full border-2 border-[#D4AF37]/50 overflow-hidden flex-shrink-0">
                <img src={designer.logo_url} alt={designer.name} className="w-full h-full object-cover" />
              </div>
              <div className="flex-1 min-w-0">
                <h4 className="text-white font-bold text-base">{designer.name}</h4>
                <p className="text-[#D4AF37] text-sm">{designer.brand}</p>
                <p className="text-[#A1A1AA] text-xs mt-1">{designer.specialty}</p>
              </div>
              <ChevronLeft size={20} className="text-[#A1A1AA] flip-rtl flex-shrink-0" />
            </div>
          ))}
        </div>
      </div>

      <BottomNav />
    </div>
  );
}

export default DesignersPage;
