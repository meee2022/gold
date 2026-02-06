import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Settings, Store, Users, Palette, Package } from "lucide-react";
import { Card, CardContent } from "../components/ui/card";
import { Badge } from "../components/ui/badge";
import { Tabs, TabsList, TabsTrigger } from "../components/ui/tabs";
import { toast } from "sonner";
import { useAuth, apiCall } from "../context/AuthContext";
import { BottomNav, TopHeader } from "../components/Navigation";
import { fetchShopsStats, fetchUsersCount } from "../admin/shopsApi";
import { fetchDesignersStats, fetchProductsStats } from "../admin/designersProductsApi";
import { fetchUsersStats } from "../admin/usersApi";

const AdminPage = () => {
  const [stats, setStats] = useState({});
  const [shopsStats, setShopsStats] = useState({ total: 0 });
  const [designersStats, setDesignersStats] = useState({ total: 0 });
  const [productsStats, setProductsStats] = useState({ total: 0 });
  const [usersStats, setUsersStats] = useState({ total: 0 });
  const [usersCount, setUsersCount] = useState(0);
  const [orders, setOrders] = useState([]);
  const [activeTab, setActiveTab] = useState("stats");
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!user || user.role !== "admin") {
      navigate("/");
      return;
    }
    fetchData();
  }, [user, navigate]);

  const fetchData = async () => {
    try {
      // Fetch main stats and orders (required)
      const statsRes = await apiCall("get", "/admin/stats").catch(() => ({ 
        data: { 
          orders_count: 0, 
          products_count: 0, 
          users_count: 0, 
          total_revenue_qar: 0 
        } 
      }));
      
      const ordersRes = await apiCall("get", "/admin/orders").catch(() => ({ data: [] }));
      
      // Fetch optional stats with fallbacks
      const [shopsStatsRes, usersCountRes, designersStatsRes, productsStatsRes, usersStatsRes] = await Promise.all([
        fetchShopsStats().catch(() => ({ total: 0, jewelry: 0, gifts: 0, active: 0, inactive: 0 })),
        fetchUsersCount().catch(() => ({ count: 0 })),
        fetchDesignersStats().catch(() => ({ total: 0, active: 0, total_products: 0 })),
        fetchProductsStats().catch(() => ({ total: 0, jewelry: 0, designer: 0, gifts: 0 })),
        fetchUsersStats().catch(() => ({ total: 0, admins: 0, customers: 0, active: 0, verified: 0 }))
      ]);
      
      setStats(statsRes.data || {});
      setOrders(ordersRes.data || []);
      setShopsStats(shopsStatsRes || { total: 0 });
      setUsersCount(usersCountRes.count || statsRes.data.users_count || 0);
      setDesignersStats(designersStatsRes || { total: 0 });
      setProductsStats(productsStatsRes || { total: 0 });
      setUsersStats(usersStatsRes || { total: 0 });
    } catch (error) {
      console.error("Error loading dashboard data:", error);
      // Set default values on error
      setStats({ orders_count: 0, products_count: 0, users_count: 0, total_revenue_qar: 0 });
      setOrders([]);
      setShopsStats({ total: 0 });
      setUsersCount(0);
      setDesignersStats({ total: 0 });
      setProductsStats({ total: 0 });
      setUsersStats({ total: 0 });
    }
    setLoading(false);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#050505] pb-20">
        <TopHeader title="لوحة التحكم" showBack />
        <div className="p-4 space-y-4">
          {[1, 2, 3, 4].map(i => <div key={i} className="skeleton h-24 rounded-xl" />)}
        </div>
        <BottomNav />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#050505] pb-20" data-testid="admin-page">
      <TopHeader title="لوحة التحكم" showBack showCart={false} showNotification={false} />

      {/* Tabs */}
      <div className="px-4 py-3">
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="bg-[#121212] border border-[#27272A] w-full">
            <TabsTrigger value="stats" className="flex-1 data-[state=active]:bg-[#D4AF37] data-[state=active]:text-black">
              الإحصائيات
            </TabsTrigger>
            <TabsTrigger value="orders" className="flex-1 data-[state=active]:bg-[#D4AF37] data-[state=active]:text-black">
              الطلبات
            </TabsTrigger>
          </TabsList>
        </Tabs>
      </div>

      {activeTab === "stats" && (
        <div className="px-4 py-2 space-y-3">
          {/* Main Stats Grid */}
          <div className="grid grid-cols-2 gap-3">
            <Card
              className="bg-[#121212] border-[#27272A] cursor-pointer hover:border-[#D4AF37] transition-colors"
              onClick={() => navigate("/admin/shops")}
            >
              <CardContent className="p-4 text-center">
                <Store className="h-6 w-6 text-[#D4AF37] mx-auto mb-1" />
                <p className="text-[#A1A1AA] text-sm">المحلات</p>
                <p className="text-2xl font-bold text-[#D4AF37]">{shopsStats.total || 0}</p>
              </CardContent>
            </Card>
            <Card
              className="bg-[#121212] border-[#27272A] cursor-pointer hover:border-[#D4AF37] transition-colors"
              onClick={() => navigate("/admin/users")}
            >
              <CardContent className="p-4 text-center">
                <Users className="h-6 w-6 text-[#D4AF37] mx-auto mb-1" />
                <p className="text-[#A1A1AA] text-sm">المستخدمين</p>
                <p className="text-2xl font-bold text-[#D4AF37]">{usersStats.total || usersCount}</p>
              </CardContent>
            </Card>
            <Card
              className="bg-[#121212] border-[#27272A] cursor-pointer hover:border-[#D4AF37] transition-colors"
              onClick={() => navigate("/admin/designers")}
            >
              <CardContent className="p-4 text-center">
                <Palette className="h-6 w-6 text-[#D4AF37] mx-auto mb-1" />
                <p className="text-[#A1A1AA] text-sm">المصممات</p>
                <p className="text-2xl font-bold text-[#D4AF37]">{designersStats.total || 0}</p>
              </CardContent>
            </Card>
            <Card
              className="bg-[#121212] border-[#27272A] cursor-pointer hover:border-[#D4AF37] transition-colors"
              onClick={() => navigate("/admin/products")}
            >
              <CardContent className="p-4 text-center">
                <Package className="h-6 w-6 text-[#D4AF37] mx-auto mb-1" />
                <p className="text-[#A1A1AA] text-sm">المنتجات</p>
                <p className="text-2xl font-bold text-[#D4AF37]">{productsStats.total || 0}</p>
              </CardContent>
            </Card>
          </div>

          {/* Orders & Revenue */}
          <div className="grid grid-cols-2 gap-3">
            <Card className="bg-[#121212] border-[#27272A]">
              <CardContent className="p-4 text-center">
                <p className="text-[#A1A1AA] text-sm">الطلبات</p>
                <p className="text-2xl font-bold text-[#D4AF37]">{stats.orders_count}</p>
              </CardContent>
            </Card>
            <Card className="bg-[#121212] border-[#27272A]">
              <CardContent className="p-4 text-center">
                <p className="text-[#A1A1AA] text-sm mb-1">الإيرادات</p>
                <p className="text-lg font-bold text-[#D4AF37]">
                  {stats.total_revenue_qar?.toLocaleString()} ر.ق
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Shops Details */}
          {shopsStats.total > 0 && (
            <Card className="bg-[#121212] border-[#27272A]">
              <CardContent className="p-4">
                <h3 className="text-white font-semibold mb-3">تفاصيل المحلات</h3>
                <div className="grid grid-cols-2 gap-3 text-center">
                  <div>
                    <p className="text-[#A1A1AA] text-xs">مجوهرات</p>
                    <p className="text-xl font-bold text-purple-400">{shopsStats.jewelry || 0}</p>
                  </div>
                  <div>
                    <p className="text-[#A1A1AA] text-xs">هدايا</p>
                    <p className="text-xl font-bold text-blue-400">{shopsStats.gifts || 0}</p>
                  </div>
                  <div>
                    <p className="text-[#A1A1AA] text-xs">نشط</p>
                    <p className="text-xl font-bold text-green-400">{shopsStats.active || 0}</p>
                  </div>
                  <div>
                    <p className="text-[#A1A1AA] text-xs">غير نشط</p>
                    <p className="text-xl font-bold text-gray-400">{shopsStats.inactive || 0}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Products Details */}
          {productsStats.total > 0 && (
            <Card className="bg-[#121212] border-[#27272A]">
              <CardContent className="p-4">
                <h3 className="text-white font-semibold mb-3">تفاصيل المنتجات</h3>
                <div className="grid grid-cols-3 gap-2 text-center">
                  <div>
                    <p className="text-[#A1A1AA] text-xs">مجوهرات</p>
                    <p className="text-lg font-bold text-yellow-400">{productsStats.jewelry || 0}</p>
                  </div>
                  <div>
                    <p className="text-[#A1A1AA] text-xs">مصممات</p>
                    <p className="text-lg font-bold text-purple-400">{productsStats.designer || 0}</p>
                  </div>
                  <div>
                    <p className="text-[#A1A1AA] text-xs">هدايا</p>
                    <p className="text-lg font-bold text-blue-400">{productsStats.gifts || 0}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Users Details */}
          {usersStats.total > 0 && (
            <Card className="bg-[#121212] border-[#27272A]">
              <CardContent className="p-4">
                <h3 className="text-white font-semibold mb-3">تفاصيل المستخدمين</h3>
                <div className="grid grid-cols-2 gap-3 text-center">
                  <div>
                    <p className="text-[#A1A1AA] text-xs">مسؤولين</p>
                    <p className="text-xl font-bold text-purple-400">{usersStats.admins || 0}</p>
                  </div>
                  <div>
                    <p className="text-[#A1A1AA] text-xs">عملاء</p>
                    <p className="text-xl font-bold text-blue-400">{usersStats.customers || 0}</p>
                  </div>
                  <div>
                    <p className="text-[#A1A1AA] text-xs">نشطين</p>
                    <p className="text-xl font-bold text-green-400">{usersStats.active || 0}</p>
                  </div>
                  <div>
                    <p className="text-[#A1A1AA] text-xs">موثقين</p>
                    <p className="text-xl font-bold text-[#D4AF37]">{usersStats.verified || 0}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      )}

      {activeTab === "orders" && (
        <div className="px-4 py-2 space-y-3">
          {orders.map((order) => (
            <Card key={order.order_id} className="bg-[#121212] border-[#27272A]">
              <CardContent className="p-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-white font-semibold">#{order.order_id.slice(-8)}</span>
                  <Badge className={order.status === "completed" ? "bg-green-500" : "bg-yellow-500"}>
                    {order.status === "completed" ? "مكتمل" : order.status === "pending" ? "قيد الانتظار" : order.status}
                  </Badge>
                </div>
                <p className="text-[#A1A1AA] text-sm">{order.items?.length} منتجات</p>
                <div className="flex items-center justify-between mt-2">
                  <span className="text-[#A1A1AA] text-sm">
                    {new Date(order.created_at).toLocaleDateString("ar-QA")}
                  </span>
                  <span className="text-[#D4AF37] font-bold">{order.total_qar?.toLocaleString()} ر.ق</span>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <BottomNav />
    </div>
  );
};

export default AdminPage;
