import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Save, X } from "lucide-react";
import { Card, CardContent } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { toast } from "sonner";
import { useAuth } from "../context/AuthContext";
import { BottomNav, TopHeader } from "../components/Navigation";
import { fetchDesignerById, createDesigner, updateDesigner } from "../admin/designersProductsApi";

const AdminDesignerFormPage = () => {
  const { id } = useParams();
  const isEditMode = Boolean(id);
  const [loading, setLoading] = useState(isEditMode);
  const [saving, setSaving] = useState(false);
  const { user } = useAuth();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    name: "",
    brand: "",
    specialty: "",
    bio: "",
    image: "",
    location: "",
    phone: "",
    instagram: "",
    whatsapp: ""
  });

  useEffect(() => {
    if (!user || user.role !== "admin") {
      navigate("/");
      return;
    }

    if (isEditMode) {
      loadDesigner();
    }
  }, [user, navigate, id]);

  const loadDesigner = async () => {
    try {
      const designer = await fetchDesignerById(id);
      setFormData({
        name: designer.name || "",
        brand: designer.brand || "",
        specialty: designer.specialty || "",
        bio: designer.bio || "",
        image: designer.image || "",
        location: designer.location || "",
        phone: designer.phone || "",
        instagram: designer.instagram || "",
        whatsapp: designer.whatsapp || ""
      });
    } catch (error) {
      toast.error("فشل في تحميل بيانات المصممة");
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.name.trim()) {
      toast.error("الرجاء إدخال اسم المصممة");
      return;
    }

    if (!formData.brand.trim()) {
      toast.error("الرجاء إدخال اسم العلامة التجارية");
      return;
    }

    try {
      setSaving(true);

      if (isEditMode) {
        await updateDesigner(id, formData);
        toast.success("تم تحديث المصممة بنجاح");
      } else {
        await createDesigner(formData);
        toast.success("تم إضافة المصممة بنجاح");
      }

      navigate("/admin/designers");
    } catch (error) {
      toast.error(isEditMode ? "فشل في تحديث المصممة" : "فشل في إضافة المصممة");
      console.error(error);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#050505] pb-20">
        <TopHeader title={isEditMode ? "تعديل المصممة" : "إضافة مصممة"} showBack />
        <div className="p-4 space-y-4">
          {[1, 2, 3, 4].map(i => (
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
        title={isEditMode ? "تعديل المصممة" : "إضافة مصممة جديدة"}
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
              <label className="text-[#A1A1AA] text-sm mb-1 block">اسم المصممة *</label>
              <Input
                name="name"
                value={formData.name}
                onChange={handleChange}
                placeholder="مثال: فاطمة الكعبي"
                className="bg-[#0A0A0A] border-[#27272A] text-white"
                required
              />
            </div>

            <div>
              <label className="text-[#A1A1AA] text-sm mb-1 block">العلامة التجارية *</label>
              <Input
                name="brand"
                value={formData.brand}
                onChange={handleChange}
                placeholder="مثال: مجوهرات فاطمة"
                className="bg-[#0A0A0A] border-[#27272A] text-white"
                required
              />
            </div>

            <div>
              <label className="text-[#A1A1AA] text-sm mb-1 block">التخصص</label>
              <Input
                name="specialty"
                value={formData.specialty}
                onChange={handleChange}
                placeholder="مثال: المجوهرات التراثية"
                className="bg-[#0A0A0A] border-[#27272A] text-white"
              />
            </div>

            <div>
              <label className="text-[#A1A1AA] text-sm mb-1 block">الموقع</label>
              <Input
                name="location"
                value={formData.location}
                onChange={handleChange}
                placeholder="مثال: الدوحة، قطر"
                className="bg-[#0A0A0A] border-[#27272A] text-white"
              />
            </div>

            <div>
              <label className="text-[#A1A1AA] text-sm mb-1 block">نبذة عن المصممة</label>
              <textarea
                name="bio"
                value={formData.bio}
                onChange={handleChange}
                placeholder="نبذة تعريفية عن المصممة وأعمالها..."
                rows={4}
                className="w-full px-3 py-2 bg-[#0A0A0A] border border-[#27272A] text-white rounded-lg resize-none"
              />
            </div>

            <div>
              <label className="text-[#A1A1AA] text-sm mb-1 block">رابط الصورة</label>
              <Input
                name="image"
                value={formData.image}
                onChange={handleChange}
                placeholder="https://example.com/image.jpg"
                className="bg-[#0A0A0A] border-[#27272A] text-white"
                dir="ltr"
              />
              {formData.image && (
                <div className="mt-2">
                  <img
                    src={formData.image}
                    alt="معاينة"
                    className="w-24 h-24 rounded-lg object-cover border border-[#27272A]"
                    onError={(e) => {
                      e.target.style.display = 'none';
                    }}
                  />
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Contact Information */}
        <Card className="bg-[#121212] border-[#27272A]">
          <CardContent className="p-4 space-y-4">
            <h3 className="text-white font-semibold text-lg mb-3">معلومات التواصل</h3>

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

            <div>
              <label className="text-[#A1A1AA] text-sm mb-1 block">إنستغرام</label>
              <Input
                name="instagram"
                value={formData.instagram}
                onChange={handleChange}
                placeholder="@username"
                className="bg-[#0A0A0A] border-[#27272A] text-white"
                dir="ltr"
              />
            </div>
          </CardContent>
        </Card>

        {/* Action Buttons */}
        <div className="flex gap-3 pt-2">
          <Button
            type="button"
            onClick={() => navigate("/admin/designers")}
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
            {saving ? "جاري الحفظ..." : isEditMode ? "حفظ التعديلات" : "إضافة المصممة"}
          </Button>
        </div>
      </form>

      <BottomNav />
    </div>
  );
};

export default AdminDesignerFormPage;
