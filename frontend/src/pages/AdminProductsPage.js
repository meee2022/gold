import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Plus, Search, Edit, Trash2, Eye, Package } from "lucide-react";
import { Card, CardContent } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Badge } from "../components/ui/badge";
import { toast } from "sonner";
import { useAuth } from "../context/AuthContext";
import { BottomNav, TopHeader } from "../components/Navigation";
import { fetchProducts, deleteProduct } from "../admin/designersProductsApi";

const AdminProductsPage = () => {
  const [products, setProducts] = useState([]);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [typeFilter, setTypeFilter] = useState("all");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!user || user.role !== "admin") {
      navigate("/");
      return;
    }
    loadProducts();
  }, [user, navigate]);

  useEffect(() => {
    filterProducts();
  }, [searchTerm, typeFilter, categoryFilter, products]);

  const loadProducts = async () => {
    try {
      setLoading(true);
      const data = await fetchProducts();
      setProducts(data || []);
    } catch (error) {
      toast.error("فشل في تحميل المنتجات");
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const filterProducts = () => {
    let filtered = [...products];

    if (searchTerm) {
      filtered = filtered.filter(product =>
        product.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        product.designer_name?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (typeFilter !== "all") {
      filtered = filtered.filter(product => product.type === typeFilter);
    }

    if (categoryFilter !== "all") {
      filtered = filtered.filter(product => product.category === categoryFilter);
    }

    setFilteredProducts(filtered);
  };

  const handleDelete = async (id, name) => {
    if (!window.confirm(`هل أنت متأكد من حذف المنتج "${name}"؟`)) {
      return;
    }

    try {
      await deleteProduct(id);
      toast.success("تم حذف المنتج بنجاح");
      loadProducts();
    } catch (error) {
      toast.error("فشل في حذف المنتج");
      console.error(error);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#050505] pb-20">
        <TopHeader title="إدارة المنتجات" showBack />
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
      <TopHeader title="إدارة المنتجات" showBack showCart={false} showNotification={false} />

      {/* Header Actions */}
      <div className="px-4 py-4 space-y-3">
        <Button
          onClick={() => navigate("/admin/products/new")}
          className="w-full bg-[#D4AF37] hover:bg-[#B8941F] text-black font-semibold"
        >
          <Plus className="ml-2 h-5 w-5" />
          إضافة منتج جديد
        </Button>

        {/* Search */}
        <div className="relative">
          <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-[#A1A1AA]" />
          <Input
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="بحث عن منتج..."
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
            <option value="designer">مصممة</option>
            <option value="gift">هدايا</option>
          </select>

          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="flex-1 px-3 py-2 bg-[#121212] border border-[#27272A] text-white rounded-lg"
          >
            <option value="all">كل الفئات</option>
            <option value="rings">خواتم</option>
            <option value="necklaces">قلائد</option>
            <option value="bracelets">أساور</option>
            <option value="earrings">أقراط</option>
            <option value="sets">طقم</option>
            <option value="other">أخرى</option>
          </select>
        </div>
      </div>

      {/* Stats Summary */}
      <div className="px-4 pb-3">
        <Card className="bg-[#121212] border-[#27272A]">
          <CardContent className="p-3">
            <div className="grid grid-cols-4 gap-2 text-center">
              <div>
                <p className="text-[#A1A1AA] text-xs">الكل</p>
                <p className="text-lg font-bold text-[#D4AF37]">{products.length}</p>
              </div>
              <div>
                <p className="text-[#A1A1AA] text-xs">مجوهرات</p>
                <p className="text-lg font-bold text-white">
                  {products.filter(p => p.type === "jewelry").length}
                </p>
              </div>
              <div>
                <p className="text-[#A1A1AA] text-xs">مصممات</p>
                <p className="text-lg font-bold text-white">
                  {products.filter(p => p.type === "designer").length}
                </p>
              </div>
              <div>
                <p className="text-[#A1A1AA] text-xs">هدايا</p>
                <p className="text-lg font-bold text-white">
                  {products.filter(p => p.type === "gift").length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Products List */}
      <div className="px-4 space-y-3">
        {filteredProducts.length === 0 ? (
          <Card className="bg-[#121212] border-[#27272A]">
            <CardContent className="p-8 text-center">
              <Package className="h-12 w-12 text-[#A1A1AA] mx-auto mb-2" />
              <p className="text-[#A1A1AA]">لا توجد منتجات</p>
            </CardContent>
          </Card>
        ) : (
          filteredProducts.map((product) => (
            <Card key={product.product_id} className="bg-[#121212] border-[#27272A]">
              <CardContent className="p-4">
                <div className="flex items-start gap-3 mb-3">
                  {/* Product Image */}
                  <div className="w-20 h-20 rounded-lg overflow-hidden border border-[#27272A] flex-shrink-0">
                    <img
                      src={product.image || product.images?.[0] || 'https://via.placeholder.com/80'}
                      alt={product.name}
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        e.target.src = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='80' height='80'%3E%3Crect fill='%23121212' width='80' height='80'/%3E%3Ctext x='50%25' y='50%25' text-anchor='middle' dy='.3em' fill='%23D4AF37' font-size='24'%3E📦%3C/text%3E%3C/svg%3E";
                      }}
                    />
                  </div>

                  {/* Product Info */}
                  <div className="flex-1">
                    <h3 className="text-white font-semibold text-lg">{product.name}</h3>
                    {product.designer_name && (
                      <p className="text-[#A1A1AA] text-sm">👤 {product.designer_name}</p>
                    )}
                    <div className="flex gap-2 mt-1 flex-wrap">
                      <Badge
                        className={
                          product.type === "jewelry"
                            ? "bg-yellow-500/20 text-yellow-400 border-yellow-500/30"
                            : product.type === "designer"
                            ? "bg-purple-500/20 text-purple-400 border-purple-500/30"
                            : "bg-blue-500/20 text-blue-400 border-blue-500/30"
                        }
                      >
                        {product.type === "jewelry" ? "مجوهرات" : product.type === "designer" ? "مصممة" : "هدايا"}
                      </Badge>
                      {product.category && (
                        <Badge className="bg-[#27272A] text-white border-none text-xs">
                          {product.category}
                        </Badge>
                      )}
                      <Badge
                        className={
                          product.stock > 0
                            ? "bg-green-500/20 text-green-400 border-green-500/30"
                            : "bg-red-500/20 text-red-400 border-red-500/30"
                        }
                      >
                        {product.stock > 0 ? `متوفر (${product.stock})` : "نفذ"}
                      </Badge>
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-between mb-3">
                  <div>
                    <p className="text-[#D4AF37] font-bold text-lg">
                      {product.price_qar?.toLocaleString()} ر.ق
                    </p>
                    {product.karat && (
                      <p className="text-[#A1A1AA] text-xs">عيار {product.karat}</p>
                    )}
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex gap-2">
                  <Button
                    onClick={() => navigate(`/admin/products/${product.product_id}`)}
                    variant="outline"
                    size="sm"
                    className="flex-1 border-[#27272A] text-white hover:bg-[#27272A]"
                  >
                    <Eye className="ml-1 h-4 w-4" />
                    عرض
                  </Button>
                  <Button
                    onClick={() => navigate(`/admin/products/${product.product_id}/edit`)}
                    variant="outline"
                    size="sm"
                    className="flex-1 border-[#D4AF37] text-[#D4AF37] hover:bg-[#D4AF37] hover:text-black"
                  >
                    <Edit className="ml-1 h-4 w-4" />
                    تعديل
                  </Button>
                  <Button
                    onClick={() => handleDelete(product.product_id, product.name)}
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

export default AdminProductsPage;
