import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Edit, Trash2, MapPin, Phone, MessageCircle, Calendar, Store } from "lucide-react";
import { Card, CardContent } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { Badge } from "../components/ui/badge";
import { toast } from "sonner";
import { useAuth } from "../context/AuthContext";
import { BottomNav, TopHeader } from "../components/Navigation";
import { fetchShopById, deleteShop } from "../admin/shopsApi";

const AdminShopDetailsPage = () => {
  const { id } = useParams();
  const [shop, setShop] = useState(null);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!user || user.role !== "admin") {
      navigate("/");
      return;
    }
    loadShop();
  }, [user, navigate, id]);

  const loadShop = async () => {
    try {
      const data = await fetchShopById(id);
      setShop(data);
    } catch (error) {
      toast.error("فشل في تحميل بيانات المحل");
      console.error(error);
      navigate("/admin/shops");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!window.confirm(`هل أنت متأكد من حذف المحل "${shop.name}"؟`)) {
      return;
    }

    try {
      await deleteShop(id);
      toast.success("تم حذف المحل بنجاح");
      navigate("/admin/shops");
    } catch (error) {
      toast.error("فشل في حذف المحل");
      console.error(error);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#050505] pb-20">
        <TopHeader title="تفاصيل المحل" showBack />
        <div className="p-4 space-y-4">
          <div className="skeleton h-64 rounded-xl" />
          <div className="skeleton h-32 rounded-xl" />
          <div className="skeleton h-32 rounded-xl" />
        </div>
        <BottomNav />
      </div>
    );
  }

  if (!shop) {
    return null;
  }

  return (
    <div className="min-h-screen bg-[#050505] pb-20">
      <TopHeader title="تفاصيل المحل" showBack showCart={false} showNotification={false} />

      <div className="px-4 py-4 space-y-4">
        {/* Shop Header */}
        <Card className="bg-[#121212] border-[#27272A]">
          <CardContent className="p-4">
            <div className="flex items-start justify-between mb-3">
              <div className="flex-1">
                <h1 className="text-white font-bold text-2xl mb-2">{shop.name}</h1>
                <div className="flex gap-2">
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
                      shop.isActive
                        ? "bg-green-500/20 text-green-400 border-green-500/30"
                        : "bg-gray-500/20 text-gray-400 border-gray-500/30"
                    }
                  >
                    {shop.isActive ? "نشط" : "غير نشط"}
                  </Badge>
                </div>
              </div>
              <Store className="h-12 w-12 text-[#D4AF37]" />
            </div>

            {shop.description && (
              <p className="text-[#A1A1AA] text-sm leading-relaxed">{shop.description}</p>
            )}
          </CardContent>
        </Card>

        {/* Images */}
        {shop.images && shop.images.length > 0 && (
          <Card className="bg-[#121212] border-[#27272A]">
            <CardContent className="p-4">
              <h3 className="text-white font-semibold mb-3">الصور ({shop.images.length})</h3>
              <div className="grid grid-cols-2 gap-3">
                {shop.images.map((image, index) => {
                  const imageUrl = typeof image === 'string' ? image : image.url;
                  return (
                    <div
                      key={index}
                      className="aspect-square rounded-lg overflow-hidden border border-[#27272A]"
                    >
                      <img
                        src={imageUrl}
                        alt={`صورة ${index + 1}`}
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          e.target.src = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='100' height='100'%3E%3Crect fill='%23121212' width='100' height='100'/%3E%3Ctext x='50%25' y='50%25' text-anchor='middle' dy='.3em' fill='%23A1A1AA'%3E404%3C/text%3E%3C/svg%3E";
                        }}
                      />
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Contact Information */}
        <Card className="bg-[#121212] border-[#27272A]">
          <CardContent className="p-4 space-y-3">
            <h3 className="text-white font-semibold mb-2">معلومات التواصل</h3>

            {shop.city && (
              <div className="flex items-center gap-3 text-[#A1A1AA]">
                <MapPin className="h-5 w-5 text-[#D4AF37]" />
                <div>
                  <p className="text-xs text-[#A1A1AA]">المدينة</p>
                  <p className="text-white">{shop.city}</p>
                </div>
              </div>
            )}

            {shop.address && (
              <div className="flex items-start gap-3 text-[#A1A1AA]">
                <MapPin className="h-5 w-5 text-[#D4AF37] mt-1" />
                <div>
                  <p className="text-xs text-[#A1A1AA]">العنوان</p>
                  <p className="text-white">{shop.address}</p>
                </div>
              </div>
            )}

            {shop.phone && (
              <div className="flex items-center gap-3 text-[#A1A1AA]">
                <Phone className="h-5 w-5 text-[#D4AF37]" />
                <div>
                  <p className="text-xs text-[#A1A1AA]">الهاتف</p>
                  <a href={`tel:${shop.phone}`} className="text-white hover:text-[#D4AF37]">
                    {shop.phone}
                  </a>
                </div>
              </div>
            )}

            {shop.whatsapp && (
              <div className="flex items-center gap-3 text-[#A1A1AA]">
                <MessageCircle className="h-5 w-5 text-[#D4AF37]" />
                <div>
                  <p className="text-xs text-[#A1A1AA]">واتساب</p>
                  <a
                    href={`https://wa.me/${shop.whatsapp.replace(/[^0-9]/g, '')}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-white hover:text-[#D4AF37]"
                  >
                    {shop.whatsapp}
                  </a>
                </div>
              </div>
            )}

            {shop.createdAt && (
              <div className="flex items-center gap-3 text-[#A1A1AA] pt-3 border-t border-[#27272A]">
                <Calendar className="h-5 w-5 text-[#D4AF37]" />
                <div>
                  <p className="text-xs text-[#A1A1AA]">تاريخ الإضافة</p>
                  <p className="text-white">
                    {new Date(shop.createdAt).toLocaleDateString("ar-QA", {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric'
                    })}
                  </p>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Action Buttons */}
        <div className="flex gap-3">
          <Button
            onClick={() => navigate(`/admin/shops/${id}/edit`)}
            className="flex-1 bg-[#D4AF37] hover:bg-[#B8941F] text-black font-semibold"
          >
            <Edit className="ml-2 h-5 w-5" />
            تعديل المحل
          </Button>
          <Button
            onClick={handleDelete}
            variant="outline"
            className="flex-1 border-red-500 text-red-500 hover:bg-red-500 hover:text-white"
          >
            <Trash2 className="ml-2 h-5 w-5" />
            حذف المحل
          </Button>
        </div>
      </div>

      <BottomNav />
    </div>
  );
};

export default AdminShopDetailsPage;
