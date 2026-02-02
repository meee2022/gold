import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Settings } from "lucide-react";
import { Card, CardContent } from "../components/ui/card";
import { Badge } from "../components/ui/badge";
import { Tabs, TabsList, TabsTrigger } from "../components/ui/tabs";
import { toast } from "sonner";
import { useAuth, apiCall } from "../context/AuthContext";
import { BottomNav, TopHeader } from "../components/Navigation";

const AdminPage = () => {
  const [stats, setStats] = useState({});
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
      const [statsRes, ordersRes] = await Promise.all([
        apiCall("get", "/admin/stats"),
        apiCall("get", "/admin/orders")
      ]);
      setStats(statsRes.data);
      setOrders(ordersRes.data);
    } catch (error) {
      console.error(error);
      toast.error("فشل في تحميل البيانات");
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
        <div className="px-4 py-2 grid grid-cols-2 gap-3">
          <Card className="bg-[#121212] border-[#27272A]">
            <CardContent className="p-4 text-center">
              <p className="text-[#A1A1AA] text-sm">المستخدمين</p>
              <p className="text-2xl font-bold text-[#D4AF37]">{stats.users_count}</p>
            </CardContent>
          </Card>
          <Card className="bg-[#121212] border-[#27272A]">
            <CardContent className="p-4 text-center">
              <p className="text-[#A1A1AA] text-sm">الطلبات</p>
              <p className="text-2xl font-bold text-[#D4AF37]">{stats.orders_count}</p>
            </CardContent>
          </Card>
          <Card className="bg-[#121212] border-[#27272A]">
            <CardContent className="p-4 text-center">
              <p className="text-[#A1A1AA] text-sm">المنتجات</p>
              <p className="text-2xl font-bold text-[#D4AF37]">{stats.products_count}</p>
            </CardContent>
          </Card>
          <Card className="bg-[#121212] border-[#27272A]">
            <CardContent className="p-4 text-center">
              <p className="text-[#A1A1AA] text-sm">الإيرادات</p>
              <p className="text-xl font-bold text-[#D4AF37]">{stats.total_revenue_qar?.toLocaleString()} ر.ق</p>
            </CardContent>
          </Card>
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
