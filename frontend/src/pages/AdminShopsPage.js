import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Plus, Search, Edit, Trash2, Eye, Store } from "lucide-react";
import { Card, CardContent } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Badge } from "../components/ui/badge";
import { toast } from "sonner";
import { useAuth } from "../context/AuthContext";
import { BottomNav, TopHeader } from "../components/Navigation";
import { fetchShops, deleteShop } from "../admin/shopsApi";

const AdminShopsPage = () => {
  const [shops, setShops] = useState([]);
  const [filteredShops, setFilteredShops] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [typeFilter, setTypeFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!user || user.role !== "admin") {
      navigate("/");
      return;
    }
    loadShops();
  }, [user, navigate]);

  useEffect(() => {
    filterShops();
  }, [searchTerm, typeFilter, statusFilter, shops]);

  const loadShops = async () => {
    try {
      setLoading(true);
      const data = await fetchShops();
      
      if (!data || data.length === 0) {
        console.log("No shops found or backend not responding");
      }
      
      setShops(data || []);
    } catch (error) {
      console.error("Error loading shops:", error);
      setShops([]);
    } finally {
      setLoading(false);
    }
  };

  const filterShops = () => {
    let filtered = [...shops];

    if (searchTerm) {
      filtered = filtered.filter(shop =>
        shop.name?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (typeFilter !== "all") {
      filtered = filtered.filter(shop => shop.type === typeFilter);
    }

    if (statusFilter !== "all") {
      const isActive = statusFilter === "active";
      filtered = filtered.filter(shop => shop.isActive === isActive);
    }

    setFilteredShops(filtered);
  };

  const handleDelete = async (id, name) => {
    if (!window.confirm(`هل أنت متأكد من حذف المحل "${name}"؟`)) {
      return;
    }

    try {
      await deleteShop(id);
      toast.success("تم حذف المحل بنجاح");
      loadShops();
    } catch (error) {
      toast.error("فشل في حذف المحل");
      console.error(error);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#050505] pb-20">
        <TopHeader title="إدارة المحلات" showBack />
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
      <TopHeader title="إدارة المحلات" showBack showCart={false} showNotification={false} />

      {/* Header Actions */}
      <div className="px-4 py-4 space-y-3">
        <Button
          onClick={() => navigate("/admin/shops/new")}
          className="w-full bg-[#D4AF37] hover:bg-[#B8941F] text-black font-semibold"
        >
          <Plus className="ml-2 h-5 w-5" />
          إضافة محل جديد
        </Button>

        {/* Search */}
        <div className="relative">
          <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-[#A1A1AA]" />
          <Input
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="بحث عن محل..."
            className="pr-10 bg-[#121212] border-[#27272A] text-white"
          />
        </div>

        {/* Filters */}
        <div className="flex gap-2">
          <select
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
            className="flex-1 px-3 py-2 bg-[#121212] border border-[#27272A] text-white rounded-lg"
          >
            <option value="all">كل الأنواع</option>
            <option value="jewelry">مجوهرات</option>
            <option value="gifts">هدايا</option>
          </select>

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="flex-1 px-3 py-2 bg-[#121212] border border-[#27272A] text-white rounded-lg"
          >
            <option value="all">كل الحالات</option>
            <option value="active">نشط</option>
            <option value="inactive">غير نشط</option>
          </select>
        </div>
      </div>

      {/* Stats Summary */}
      <div className="px-4 pb-3">
        <Card className="bg-[#121212] border-[#27272A]">
          <CardContent className="p-3">
            <div className="flex justify-around text-center">
              <div>
                <p className="text-[#A1A1AA] text-xs">الإجمالي</p>
                <p className="text-lg font-bold text-[#D4AF37]">{shops.length}</p>
              </div>
              <div className="border-r border-[#27272A]"></div>
              <div>
                <p className="text-[#A1A1AA] text-xs">مجوهرات</p>
                <p className="text-lg font-bold text-white">
                  {shops.filter(s => s.type === "jewelry").length}
                </p>
              </div>
              <div className="border-r border-[#27272A]"></div>
              <div>
                <p className="text-[#A1A1AA] text-xs">هدايا</p>
                <p className="text-lg font-bold text-white">
                  {shops.filter(s => s.type === "gifts").length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Shops List */}
      <div className="px-4 space-y-3">
        {filteredShops.length === 0 ? (
          <Card className="bg-[#121212] border-[#27272A]">
            <CardContent className="p-8 text-center">
              <Store className="h-12 w-12 text-[#A1A1AA] mx-auto mb-2" />
              <p className="text-[#A1A1AA]">لا توجد محلات</p>
            </CardContent>
          </Card>
        ) : (
          filteredShops.map((shop) => (
            <Card key={shop.merchant_id || shop.shop_id || shop.id} className="bg-[#121212] border-[#27272A]">
              <CardContent className="p-4">
                <div className="flex items-start justify-between mb-2">
                  <div className="flex-1">
                    <h3 className="text-white font-semibold text-lg">{shop.name}</h3>
                    <div className="flex gap-2 mt-1">
                      <Badge
                        className={
                          shop.type === "jewelry"
                            ? "bg-purple-500/20 text-purple-400 border-purple-500/30"
                            : "bg-blue-500/20 text-blue-400 border-blue-500/30"
                        }
                      >
                        {shop.type === "jewelry" ? "مجوهرات" : "هدايا"}
                      </Badge>
                      <Badge
                        className={
                          shop.is_active || shop.isActive
                            ? "bg-green-500/20 text-green-400 border-green-500/30"
                            : "bg-gray-500/20 text-gray-400 border-gray-500/30"
                        }
                      >
                        {(shop.is_active || shop.isActive) ? "نشط" : "غير نشط"}
                      </Badge>
                    </div>
                  </div>
                </div>

                <p className="text-[#A1A1AA] text-sm mb-2 line-clamp-2">
                  {shop.description || "لا يوجد وصف"}
                </p>

                <div className="text-[#A1A1AA] text-xs space-y-1 mb-3">
                  {shop.city && <p>📍 {shop.city}</p>}
                  {shop.phone && <p>📞 {shop.phone}</p>}
                  <p>📅 {new Date(shop.createdAt || shop.created_at || Date.now()).toLocaleDateString("ar-QA")}</p>
                </div>

                {/* Action Buttons */}
                <div className="flex gap-2">
                  <Button
                    onClick={() => navigate(`/admin/shops/${shop.merchant_id || shop.shop_id || shop.id}`)}
                    variant="outline"
                    size="sm"
                    className="flex-1 border-[#27272A] text-white hover:bg-[#27272A]"
                  >
                    <Eye className="ml-1 h-4 w-4" />
                    عرض
                  </Button>
                  <Button
                    onClick={() => navigate(`/admin/shops/${shop.merchant_id || shop.shop_id || shop.id}/edit`)}
                    variant="outline"
                    size="sm"
                    className="flex-1 border-[#D4AF37] text-[#D4AF37] hover:bg-[#D4AF37] hover:text-black"
                  >
                    <Edit className="ml-1 h-4 w-4" />
                    تعديل
                  </Button>
                  <Button
                    onClick={() => handleDelete(shop.merchant_id || shop.shop_id || shop.id, shop.name)}
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

export default AdminShopsPage;
