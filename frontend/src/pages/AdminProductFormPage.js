import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Save, X, Plus, Trash2, Image as ImageIcon } from "lucide-react";
import { Card, CardContent } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { toast } from "sonner";
import { useAuth } from "../context/AuthContext";
import { BottomNav, TopHeader } from "../components/Navigation";
import { 
  fetchProductById, 
  createProduct, 
  updateProduct,
  fetchDesigners
} from "../admin/designersProductsApi";

const AdminProductFormPage = () => {
  const { id } = useParams();
  const isEditMode = Boolean(id);
  const [loading, setLoading] = useState(isEditMode);
  const [saving, setSaving] = useState(false);
  const [designers, setDesigners] = useState([]);
  const { user } = useAuth();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    name: "",
    type: "jewelry",
    category: "",
    description: "",
    price_qar: "",
    weight: "",
    karat: "24",
    designer_id: "",
    designer_name: "",
    stock: "1",
    images: [],
    specifications: {}
  });

  const [newImageUrl, setNewImageUrl] = useState("");
  const [showImageInput, setShowImageInput] = useState(false);

  useEffect(() => {
    if (!user || user.role !== "admin") {
      navigate("/");
      return;
    }

    loadDesigners();

    if (isEditMode) {
      loadProduct();
    }
  }, [user, navigate, id]);

  const loadDesigners = async () => {
    try {
      const data = await fetchDesigners();
      setDesigners(data || []);
    } catch (error) {
      console.error("Error loading designers:", error);
    }
  };

  const loadProduct = async () => {
    try {
      const product = await fetchProductById(id);
      setFormData({
        name: product.name || "",
        type: product.type || "jewelry",
        category: product.category || "",
        description: product.description || "",
        price_qar: product.price_qar || "",
        weight: product.weight || "",
        karat: product.karat || "24",
        designer_id: product.designer_id || "",
        designer_name: product.designer_name || "",
        stock: product.stock || "1",
        images: product.images || [],
        specifications: product.specifications || {}
      });
    } catch (error) {
      toast.error("فشل في تحميل بيانات المنتج");
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

  const handleDesignerChange = (e) => {
    const designerId = e.target.value;
    const designer = designers.find(d => d.designer_id === designerId);
    
    setFormData(prev => ({
      ...prev,
      designer_id: designerId,
      designer_name: designer ? designer.name : "",
      type: designerId ? "designer" : "jewelry"
    }));
  };

  const handleAddImage = () => {
    if (!newImageUrl.trim()) {
      toast.error("الرجاء إدخال رابط الصورة");
      return;
    }

    setFormData(prev => ({
      ...prev,
      images: [...prev.images, newImageUrl]
    }));
    setNewImageUrl("");
    setShowImageInput(false);
    toast.success("تم إضافة الصورة");
  };

  const handleRemoveImage = (index) => {
    setFormData(prev => ({
      ...prev,
      images: prev.images.filter((_, i) => i !== index)
    }));
    toast.success("تم حذف الصورة");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.name.trim()) {
      toast.error("الرجاء إدخال اسم المنتج");
      return;
    }

    if (!formData.price_qar || parseFloat(formData.price_qar) <= 0) {
      toast.error("الرجاء إدخال سعر صحيح");
      return;
    }

    try {
      setSaving(true);

      const productData = {
        ...formData,
        price_qar: parseFloat(formData.price_qar),
        weight: formData.weight ? parseFloat(formData.weight) : null,
        stock: parseInt(formData.stock) || 0
      };

      if (isEditMode) {
        await updateProduct(id, productData);
        toast.success("تم تحديث المنتج بنجاح");
      } else {
        await createProduct(productData);
        toast.success("تم إضافة المنتج بنجاح");
      }

      navigate("/admin/products");
    } catch (error) {
      toast.error(isEditMode ? "فشل في تحديث المنتج" : "فشل في إضافة المنتج");
      console.error(error);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#050505] pb-20">
        <TopHeader title={isEditMode ? "تعديل المنتج" : "إضافة منتج"} showBack />
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
        title={isEditMode ? "تعديل المنتج" : "إضافة منتج جديد"}
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
              <label className="text-[#A1A1AA] text-sm mb-1 block">اسم المنتج *</label>
              <Input
                name="name"
                value={formData.name}
                onChange={handleChange}
                placeholder="مثال: خاتم ذهب عيار 21"
                className="bg-[#0A0A0A] border-[#27272A] text-white"
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-[#A1A1AA] text-sm mb-1 block">النوع *</label>
                <select
                  name="type"
                  value={formData.type}
                  onChange={handleChange}
                  className="w-full px-3 py-2 bg-[#0A0A0A] border border-[#27272A] text-white rounded-lg"
                  required
                  disabled={formData.designer_id}
                >
                  <option value="jewelry">مجوهرات</option>
                  <option value="designer">مصممة</option>
                  <option value="gift">هدايا</option>
                </select>
              </div>

              <div>
                <label className="text-[#A1A1AA] text-sm mb-1 block">الفئة</label>
                <select
                  name="category"
                  value={formData.category}
                  onChange={handleChange}
                  className="w-full px-3 py-2 bg-[#0A0A0A] border border-[#27272A] text-white rounded-lg"
                >
                  <option value="">اختر الفئة</option>
                  <option value="rings">خواتم</option>
                  <option value="necklaces">قلائد</option>
                  <option value="bracelets">أساور</option>
                  <option value="earrings">أقراط</option>
                  <option value="sets">طقم</option>
                  <option value="other">أخرى</option>
                </select>
              </div>
            </div>

            <div>
              <label className="text-[#A1A1AA] text-sm mb-1 block">المصممة</label>
              <select
                value={formData.designer_id}
                onChange={handleDesignerChange}
                className="w-full px-3 py-2 bg-[#0A0A0A] border border-[#27272A] text-white rounded-lg"
              >
                <option value="">بدون مصممة</option>
                {designers.map(designer => (
                  <option key={designer.designer_id} value={designer.designer_id}>
                    {designer.name} - {designer.brand}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="text-[#A1A1AA] text-sm mb-1 block">الوصف</label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleChange}
                placeholder="وصف المنتج والمواصفات..."
                rows={4}
                className="w-full px-3 py-2 bg-[#0A0A0A] border border-[#27272A] text-white rounded-lg resize-none"
              />
            </div>
          </CardContent>
        </Card>

        {/* Pricing & Stock */}
        <Card className="bg-[#121212] border-[#27272A]">
          <CardContent className="p-4 space-y-4">
            <h3 className="text-white font-semibold text-lg mb-3">السعر والمخزون</h3>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-[#A1A1AA] text-sm mb-1 block">السعر (ر.ق) *</label>
                <Input
                  name="price_qar"
                  type="number"
                  step="0.01"
                  value={formData.price_qar}
                  onChange={handleChange}
                  placeholder="0.00"
                  className="bg-[#0A0A0A] border-[#27272A] text-white"
                  required
                />
              </div>

              <div>
                <label className="text-[#A1A1AA] text-sm mb-1 block">المخزون</label>
                <Input
                  name="stock"
                  type="number"
                  value={formData.stock}
                  onChange={handleChange}
                  placeholder="1"
                  className="bg-[#0A0A0A] border-[#27272A] text-white"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-[#A1A1AA] text-sm mb-1 block">الوزن (جرام)</label>
                <Input
                  name="weight"
                  type="number"
                  step="0.01"
                  value={formData.weight}
                  onChange={handleChange}
                  placeholder="0.00"
                  className="bg-[#0A0A0A] border-[#27272A] text-white"
                />
              </div>

              <div>
                <label className="text-[#A1A1AA] text-sm mb-1 block">العيار</label>
                <select
                  name="karat"
                  value={formData.karat}
                  onChange={handleChange}
                  className="w-full px-3 py-2 bg-[#0A0A0A] border border-[#27272A] text-white rounded-lg"
                >
                  <option value="24">24</option>
                  <option value="22">22</option>
                  <option value="21">21</option>
                  <option value="18">18</option>
                </select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Images */}
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
                {formData.images.map((imageUrl, index) => (
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
                      onClick={() => handleRemoveImage(index)}
                      size="sm"
                      className="absolute top-1 left-1 bg-red-500 hover:bg-red-600 h-8 w-8 p-0"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Action Buttons */}
        <div className="flex gap-3 pt-2">
          <Button
            type="button"
            onClick={() => navigate("/admin/products")}
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
            {saving ? "جاري الحفظ..." : isEditMode ? "حفظ التعديلات" : "إضافة المنتج"}
          </Button>
        </div>
      </form>

      <BottomNav />
    </div>
  );
};

export default AdminProductFormPage;
