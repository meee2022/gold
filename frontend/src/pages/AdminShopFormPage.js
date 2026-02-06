import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Save, X, Plus, Trash2, Image as ImageIcon } from "lucide-react";
import { Card, CardContent } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { toast } from "sonner";
import { useAuth } from "../context/AuthContext";
import { BottomNav, TopHeader } from "../components/Navigation";
import { fetchShopById, createShop, updateShop, addShopImage, removeShopImage } from "../admin/shopsApi";

const AdminShopFormPage = () => {
  const { id } = useParams();
  const isEditMode = Boolean(id);
  const [loading, setLoading] = useState(isEditMode);
  const [saving, setSaving] = useState(false);
  const { user } = useAuth();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    name: "",
    type: "jewelry",
    description: "",
    address: "",
    city: "",
    phone: "",
    whatsapp: "",
    images: [],
    isActive: true
  });

  const [newImageUrl, setNewImageUrl] = useState("");
  const [showImageInput, setShowImageInput] = useState(false);

  useEffect(() => {
    if (!user || user.role !== "admin") {
      navigate("/");
      return;
    }

    if (isEditMode) {
      loadShop();
    }
  }, [user, navigate, id]);

  const loadShop = async () => {
    try {
      const shop = await fetchShopById(id);
      setFormData({
        name: shop.name || "",
        type: shop.type || "jewelry",
        description: shop.description || "",
        address: shop.address || "",
        city: shop.city || "",
        phone: shop.phone || "",
        whatsapp: shop.whatsapp || "",
        images: shop.images || [],
        isActive: shop.isActive !== undefined ? shop.isActive : true
      });
    } catch (error) {
      toast.error("فشل في تحميل بيانات المحل");
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value
    }));
  };

  const handleAddImage = () => {
    if (!newImageUrl.trim()) {
      toast.error("الرجاء إدخال رابط الصورة");
      return;
    }

    setFormData(prev => ({
      ...prev,
      images: [...prev.images, { url: newImageUrl, image_id: Date.now().toString() }]
    }));
    setNewImageUrl("");
    setShowImageInput(false);
    toast.success("تم إضافة الصورة");
  };

  const handleRemoveImage = async (imageId, index) => {
    try {
      if (isEditMode && imageId) {
        await removeShopImage(id, imageId);
      }
      
      setFormData(prev => ({
        ...prev,
        images: prev.images.filter((_, i) => i !== index)
      }));
      toast.success("تم حذف الصورة");
    } catch (error) {
      toast.error("فشل في حذف الصورة");
      console.error(error);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.name.trim()) {
      toast.error("الرجاء إدخال اسم المحل");
      return;
    }

    try {
      setSaving(true);

      const shopData = {
        ...formData,
        images: formData.images.map(img => typeof img === 'string' ? img : img.url)
      };

      if (isEditMode) {
        await updateShop(id, shopData);
        toast.success("تم تحديث المحل بنجاح");
      } else {
        await createShop(shopData);
        toast.success("تم إضافة المحل بنجاح");
      }

      navigate("/admin/shops");
    } catch (error) {
      toast.error(isEditMode ? "فشل في تحديث المحل" : "فشل في إضافة المحل");
      console.error(error);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#050505] pb-20">
        <TopHeader title={isEditMode ? "تعديل المحل" : "إضافة محل"} showBack />
        <div className="p-4 space-y-4">
          {[1, 2, 3, 4, 5].map(i => (
            <div key={i} className="skeleton h-16 rounded-xl" />
          ))}
        </div>
        <BottomNav />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#050505] pb-20">
      <TopHeader
        title={isEditMode ? "تعديل المحل" : "إضافة محل جديد"}
        showBack
        showCart={false}
        showNotification={false}
      />

      <form onSubmit={handleSubmit} className="px-4 py-4 space-y-4">
        {/* Basic Information */}
        <Card className="bg-[#121212] border-[#27272A]">
          <CardContent className="p-4 space-y-4">
            <h3 className="text-white font-semibold text-lg mb-3">المعلومات الأساسية</h3>

            <div>
              <label className="text-[#A1A1AA] text-sm mb-1 block">اسم المحل *</label>
              <Input
                name="name"
                value={formData.name}
                onChange={handleChange}
                placeholder="مثال: محل الماس للمجوهرات"
                className="bg-[#0A0A0A] border-[#27272A] text-white"
                required
              />
            </div>

            <div>
              <label className="text-[#A1A1AA] text-sm mb-1 block">النوع *</label>
              <select
                name="type"
                value={formData.type}
                onChange={handleChange}
                className="w-full px-3 py-2 bg-[#0A0A0A] border border-[#27272A] text-white rounded-lg"
                required
              >
                <option value="jewelry">مجوهرات</option>
                <option value="gifts">هدايا</option>
              </select>
            </div>

            <div>
              <label className="text-[#A1A1AA] text-sm mb-1 block">الوصف</label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleChange}
                placeholder="وصف المحل والخدمات المقدمة..."
                rows={4}
                className="w-full px-3 py-2 bg-[#0A0A0A] border border-[#27272A] text-white rounded-lg resize-none"
              />
            </div>

            <div className="flex items-center gap-3">
              <input
                type="checkbox"
                name="isActive"
                checked={formData.isActive}
                onChange={handleChange}
                className="h-5 w-5 rounded border-[#27272A] bg-[#0A0A0A] text-[#D4AF37]"
              />
              <label className="text-white text-sm">محل نشط</label>
            </div>
          </CardContent>
        </Card>

        {/* Contact Information */}
        <Card className="bg-[#121212] border-[#27272A]">
          <CardContent className="p-4 space-y-4">
            <h3 className="text-white font-semibold text-lg mb-3">معلومات التواصل</h3>

            <div>
              <label className="text-[#A1A1AA] text-sm mb-1 block">المدينة</label>
              <Input
                name="city"
                value={formData.city}
                onChange={handleChange}
                placeholder="مثال: الدوحة"
                className="bg-[#0A0A0A] border-[#27272A] text-white"
              />
            </div>

            <div>
              <label className="text-[#A1A1AA] text-sm mb-1 block">العنوان</label>
              <Input
                name="address"
                value={formData.address}
                onChange={handleChange}
                placeholder="العنوان الكامل..."
                className="bg-[#0A0A0A] border-[#27272A] text-white"
              />
            </div>

            <div>
              <label className="text-[#A1A1AA] text-sm mb-1 block">رقم الهاتف</label>
              <Input
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                placeholder="+974 XXXX XXXX"
                className="bg-[#0A0A0A] border-[#27272A] text-white"
                dir="ltr"
              />
            </div>

            <div>
              <label className="text-[#A1A1AA] text-sm mb-1 block">واتساب</label>
              <Input
                name="whatsapp"
                value={formData.whatsapp}
                onChange={handleChange}
                placeholder="+974 XXXX XXXX"
                className="bg-[#0A0A0A] border-[#27272A] text-white"
                dir="ltr"
              />
            </div>
          </CardContent>
        </Card>

        {/* Images Management */}
        <Card className="bg-[#121212] border-[#27272A]">
          <CardContent className="p-4 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-white font-semibold text-lg">الصور ({formData.images.length})</h3>
              <Button
                type="button"
                onClick={() => setShowImageInput(!showImageInput)}
                size="sm"
                className="bg-[#D4AF37] hover:bg-[#B8941F] text-black"
              >
                <Plus className="ml-1 h-4 w-4" />
                إضافة صورة
              </Button>
            </div>

            {showImageInput && (
              <div className="flex gap-2">
                <Input
                  value={newImageUrl}
                  onChange={(e) => setNewImageUrl(e.target.value)}
                  placeholder="https://example.com/image.jpg"
                  className="bg-[#0A0A0A] border-[#27272A] text-white"
                  dir="ltr"
                />
                <Button
                  type="button"
                  onClick={handleAddImage}
                  size="sm"
                  className="bg-green-500 hover:bg-green-600"
                >
                  إضافة
                </Button>
                <Button
                  type="button"
                  onClick={() => {
                    setShowImageInput(false);
                    setNewImageUrl("");
                  }}
                  size="sm"
                  variant="outline"
                  className="border-[#27272A]"
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            )}

            {formData.images.length === 0 ? (
              <div className="text-center py-8 border border-dashed border-[#27272A] rounded-lg">
                <ImageIcon className="h-12 w-12 text-[#A1A1AA] mx-auto mb-2" />
                <p className="text-[#A1A1AA] text-sm">لا توجد صور</p>
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-3">
                {formData.images.map((image, index) => {
                  const imageUrl = typeof image === 'string' ? image : image.url;
                  return (
                    <div
                      key={index}
                      className="relative aspect-square rounded-lg overflow-hidden border border-[#27272A] bg-[#0A0A0A]"
                    >
                      <img
                        src={imageUrl}
                        alt={`صورة ${index + 1}`}
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          e.target.src = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='100' height='100'%3E%3Crect fill='%23121212' width='100' height='100'/%3E%3Ctext x='50%25' y='50%25' text-anchor='middle' dy='.3em' fill='%23A1A1AA'%3E404%3C/text%3E%3C/svg%3E";
                        }}
                      />
                      <Button
                        type="button"
                        onClick={() => handleRemoveImage(image.image_id, index)}
                        size="sm"
                        className="absolute top-1 left-1 bg-red-500 hover:bg-red-600 h-8 w-8 p-0"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Action Buttons */}
        <div className="flex gap-3 pt-2">
          <Button
            type="button"
            onClick={() => navigate("/admin/shops")}
            variant="outline"
            className="flex-1 border-[#27272A] text-white"
            disabled={saving}
          >
            <X className="ml-2 h-5 w-5" />
            إلغاء
          </Button>
          <Button
            type="submit"
            className="flex-1 bg-[#D4AF37] hover:bg-[#B8941F] text-black font-semibold"
            disabled={saving}
          >
            <Save className="ml-2 h-5 w-5" />
            {saving ? "جاري الحفظ..." : isEditMode ? "حفظ التعديلات" : "إضافة المحل"}
          </Button>
        </div>
      </form>

      <BottomNav />
    </div>
  );
};

export default AdminShopFormPage;
