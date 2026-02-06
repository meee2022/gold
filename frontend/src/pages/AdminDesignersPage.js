import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Plus, Search, Edit, Trash2, Eye, Palette, Package } from "lucide-react";
import { Card, CardContent } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Badge } from "../components/ui/badge";
import { toast } from "sonner";
import { useAuth } from "../context/AuthContext";
import { BottomNav, TopHeader } from "../components/Navigation";
import { fetchDesigners, deleteDesigner } from "../admin/designersProductsApi";

const AdminDesignersPage = () => {
  const [designers, setDesigners] = useState([]);
  const [filteredDesigners, setFilteredDesigners] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!user || user.role !== "admin") {
      navigate("/");
      return;
    }
    loadDesigners();
  }, [user, navigate]);

  useEffect(() => {
    filterDesigners();
  }, [searchTerm, designers]);

  const loadDesigners = async () => {
    try {
      setLoading(true);
      const data = await fetchDesigners();
      setDesigners(data || []);
    } catch (error) {
      toast.error("فشل في تحميل المصممات");
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const filterDesigners = () => {
    let filtered = [...designers];

    if (searchTerm) {
      filtered = filtered.filter(designer =>
        designer.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        designer.brand?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    setFilteredDesigners(filtered);
  };

  const handleDelete = async (id, name) => {
    if (!window.confirm(`هل أنت متأكد من حذف المصممة "${name}"؟\nسيتم حذف جميع منتجاتها أيضاً.`)) {
      return;
    }

    try {
      await deleteDesigner(id);
      toast.success("تم حذف المصممة بنجاح");
      loadDesigners();
    } catch (error) {
      toast.error("فشل في حذف المصممة");
      console.error(error);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#050505] pb-20">
        <TopHeader title="إدارة المصممات" showBack />
        <div className="p-4 space-y-4">
          {[1, 2, 3].map(i => (
            <div key={i} className="skeleton h-32 rounded-xl" />
          ))}
        </div>
        <BottomNav />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#050505] pb-20">
      <TopHeader title="إدارة المصممات القطريات" showBack showCart={false} showNotification={false} />

      {/* Header Actions */}
      <div className="px-4 py-4 space-y-3">
        <Button
          onClick={() => navigate("/admin/designers/new")}
          className="w-full bg-[#D4AF37] hover:bg-[#B8941F] text-black font-semibold"
        >
          <Plus className="ml-2 h-5 w-5" />
          إضافة مصممة جديدة
        </Button>

        {/* Search */}
        <div className="relative">
          <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-[#A1A1AA]" />
          <Input
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="بحث عن مصممة..."
            className="pr-10 bg-[#121212] border-[#27272A] text-white"
          />
        </div>
      </div>

      {/* Stats Summary */}
      <div className="px-4 pb-3">
        <Card className="bg-[#121212] border-[#27272A]">
          <CardContent className="p-3">
            <div className="flex justify-around text-center">
              <div>
                <p className="text-[#A1A1AA] text-xs">إجمالي المصممات</p>
                <p className="text-lg font-bold text-[#D4AF37]">{designers.length}</p>
              </div>
              <div className="border-r border-[#27272A]"></div>
              <div>
                <p className="text-[#A1A1AA] text-xs">منتجاتهن</p>
                <p className="text-lg font-bold text-white">
                  {designers.reduce((sum, d) => sum + (d.products_count || 0), 0)}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Designers List */}
      <div className="px-4 space-y-3">
        {filteredDesigners.length === 0 ? (
          <Card className="bg-[#121212] border-[#27272A]">
            <CardContent className="p-8 text-center">
              <Palette className="h-12 w-12 text-[#A1A1AA] mx-auto mb-2" />
              <p className="text-[#A1A1AA]">لا توجد مصممات</p>
            </CardContent>
          </Card>
        ) : (
          filteredDesigners.map((designer) => (
            <Card key={designer.designer_id} className="bg-[#121212] border-[#27272A]">
              <CardContent className="p-4">
                <div className="flex items-start gap-3 mb-3">
                  {/* Designer Image */}
                  <div className="w-20 h-20 rounded-lg overflow-hidden border border-[#27272A] flex-shrink-0">
                    <img
                      src={designer.image || 'https://via.placeholder.com/80'}
                      alt={designer.name}
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        e.target.src = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='80' height='80'%3E%3Crect fill='%23121212' width='80' height='80'/%3E%3Ctext x='50%25' y='50%25' text-anchor='middle' dy='.3em' fill='%23D4AF37' font-size='32'%3E👤%3C/text%3E%3C/svg%3E";
                      }}
                    />
                  </div>

                  {/* Designer Info */}
                  <div className="flex-1">
                    <h3 className="text-white font-semibold text-lg">{designer.name}</h3>
                    <p className="text-[#D4AF37] text-sm">{designer.brand}</p>
                    {designer.specialty && (
                      <Badge className="mt-1 bg-purple-500/20 text-purple-400 border-purple-500/30">
                        {designer.specialty}
                      </Badge>
                    )}
                  </div>
                </div>

                {designer.bio && (
                  <p className="text-[#A1A1AA] text-sm mb-3 line-clamp-2">{designer.bio}</p>
                )}

                <div className="flex items-center gap-2 text-[#A1A1AA] text-xs mb-3">
                  {designer.location && <span>📍 {designer.location}</span>}
                  {designer.products_count !== undefined && (
                    <Badge className="bg-[#27272A] text-white border-none">
                      <Package className="h-3 w-3 ml-1" />
                      {designer.products_count} منتج
                    </Badge>
                  )}
                </div>

                {/* Action Buttons */}
                <div className="flex gap-2">
                  <Button
                    onClick={() => navigate(`/admin/designers/${designer.designer_id}`)}
                    variant="outline"
                    size="sm"
                    className="flex-1 border-[#27272A] text-white hover:bg-[#27272A]"
                  >
                    <Eye className="ml-1 h-4 w-4" />
                    عرض
                  </Button>
                  <Button
                    onClick={() => navigate(`/admin/designers/${designer.designer_id}/edit`)}
                    variant="outline"
                    size="sm"
                    className="flex-1 border-[#D4AF37] text-[#D4AF37] hover:bg-[#D4AF37] hover:text-black"
                  >
                    <Edit className="ml-1 h-4 w-4" />
                    تعديل
                  </Button>
                  <Button
                    onClick={() => handleDelete(designer.designer_id, designer.name)}
                    variant="outline"
                    size="sm"
                    className="flex-1 border-red-500 text-red-500 hover:bg-red-500 hover:text-white"
                  >
                    <Trash2 className="ml-1 h-4 w-4" />
                    حذف
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>

      <BottomNav />
    </div>
  );
};

export default AdminDesignersPage;
