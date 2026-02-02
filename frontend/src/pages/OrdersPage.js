import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Package } from "lucide-react";
import { Button } from "../components/ui/button";
import { Card, CardContent } from "../components/ui/card";
import { Badge } from "../components/ui/badge";
import { useAuth, apiCall } from "../context/AuthContext";
import { BottomNav, TopHeader } from "../components/Navigation";

const OrdersPage = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (user) {
      fetchOrders();
    } else {
      setLoading(false);
    }
  }, [user]);

  const fetchOrders = async () => {
    try {
      const response = await apiCall("get", "/orders");
      setOrders(response.data);
    } catch (error) {
      console.error(error);
    }
    setLoading(false);
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "completed": return "bg-green-500";
      case "processing": return "bg-yellow-500";
      case "cancelled": return "bg-red-500";
      default: return "bg-blue-500";
    }
  };

  const getStatusLabel = (status) => {
    switch (status) {
      case "completed": return "مكتمل";
      case "processing": return "قيد التنفيذ";
      case "cancelled": return "ملغي";
      case "pending": return "قيد الانتظار";
      default: return status;
    }
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-[#050505] pb-20">
        <TopHeader title="طلباتي" showBack />
        <div className="flex flex-col items-center justify-center h-[60vh]">
          <Package size={64} className="text-[#27272A] mb-4" />
          <p className="text-[#A1A1AA]">يرجى تسجيل الدخول</p>
        </div>
        <BottomNav />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#050505] pb-20" data-testid="orders-page">
      <TopHeader title="طلباتي" showBack />

      {loading ? (
        <div className="p-4 space-y-4">
          {[1, 2, 3].map(i => <div key={i} className="skeleton h-32 rounded-xl" />)}
        </div>
      ) : orders.length === 0 ? (
        <div className="flex flex-col items-center justify-center h-[60vh] px-4">
          <Package size={64} className="text-[#27272A] mb-4" />
          <p className="text-[#A1A1AA] mb-4">لا توجد طلبات</p>
          <Button onClick={() => navigate("/store")} className="bg-[#D4AF37] hover:bg-[#F4C430] text-black rounded-full">
            تسوق الآن
          </Button>
        </div>
      ) : (
        <div className="px-4 py-4 space-y-3">
          {orders.map((order) => (
            <Card key={order.order_id} className="bg-[#121212] border-[#27272A]" data-testid={`order-${order.order_id}`}>
              <CardContent className="p-4">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-[#A1A1AA] text-sm">#{order.order_id.slice(-8)}</span>
                  <Badge className={`${getStatusColor(order.status)} text-white`}>
                    {getStatusLabel(order.status)}
                  </Badge>
                </div>
                <div className="space-y-2">
                  {order.items?.slice(0, 2).map((item, idx) => (
                    <div key={idx} className="flex items-center justify-between text-sm">
                      <span className="text-white">{item.title}</span>
                      <span className="text-[#A1A1AA]">x{item.quantity}</span>
                    </div>
                  ))}
                  {order.items?.length > 2 && (
                    <p className="text-[#A1A1AA] text-sm">+{order.items.length - 2} منتجات أخرى</p>
                  )}
                </div>
                <div className="flex items-center justify-between mt-3 pt-3 border-t border-[#27272A]">
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

export default OrdersPage;
