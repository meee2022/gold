import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { User, Package, Heart, MapPin, CreditCard, Settings, LogOut, ChevronLeft, Info, Shield, Trash2 } from "lucide-react";
import { Button } from "../components/ui/button";
import { Card, CardContent } from "../components/ui/card";
import { Badge } from "../components/ui/badge";
import { toast } from "sonner";
import { useAuth, apiCall } from "../context/AuthContext";
import { BottomNav, TopHeader } from "../components/Navigation";

const ProfilePage = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [orders, setOrders] = useState([]);

  useEffect(() => {
    if (user) {
      fetchOrders();
    }
  }, [user]);

  const fetchOrders = async () => {
    try {
      const response = await apiCall("get", "/orders");
      setOrders(response.data);
    } catch (error) {
      console.error(error);
    }
  };

  const handleLogout = async () => {
    await logout();
    navigate("/");
    toast.success("تم تسجيل الخروج");
  };

  const handleDeleteAccount = async () => {
    const confirmed = window.confirm(
      "⚠️ تحذير: هل أنت متأكد من حذف حسابك نهائياً؟\n\nسيتم حذف جميع بياناتك بما في ذلك:\n- الطلبات\n- المحفظة\n- الإشعارات\n\nهذا الإجراء لا يمكن التراجع عنه!"
    );
    
    if (!confirmed) return;
    
    const doubleConfirm = window.confirm(
      "هل أنت متأكد تماماً؟ اضغط موافق للحذف النهائي."
    );
    
    if (!doubleConfirm) return;
    
    try {
      await apiCall("delete", "/auth/delete-account");
      await logout();
      navigate("/");
      toast.success("تم حذف حسابك بنجاح");
    } catch (error) {
      toast.error("فشل في حذف الحساب");
      console.error(error);
    }
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-[#050505] pb-20">
        <TopHeader title="حسابي" />
        <div className="flex flex-col items-center justify-center h-[60vh] px-4">
          <User size={64} className="text-[#27272A] mb-4" />
          <p className="text-[#A1A1AA] mb-4">يرجى تسجيل الدخول للوصول لحسابك</p>
          <Button onClick={() => navigate("/auth")} className="bg-[#D4AF37] hover:bg-[#F4C430] text-black rounded-full">
            تسجيل الدخول
          </Button>
        </div>
        <BottomNav />
      </div>
    );
  }

  const menuItems = [
    { icon: Package, label: "طلباتي", path: "/orders", count: orders.length },
    { icon: Heart, label: "المفضلة", path: "/favorites" },
    { icon: MapPin, label: "العناوين", path: "/addresses" },
    { icon: CreditCard, label: "طرق الدفع", path: "/payments" },
    { icon: Shield, label: "الشروط الشرعية", path: "/sharia" },
    { icon: Info, label: "عن زينة وخزينة", path: "/about" },
    { icon: Settings, label: "الإعدادات", path: "/settings" },
  ];

  return (
    <div className="min-h-screen bg-[#050505] pb-20" data-testid="profile-page">
      <TopHeader title="حسابي" showCart={false} />

      {/* Profile Card */}
      <div className="px-4 py-4">
        <Card className="bg-gradient-to-br from-[#1A1A1A] to-[#0A0A0A] border-[#27272A]">
          <CardContent className="p-4 flex items-center gap-4">
            <div className="w-16 h-16 rounded-full border-2 border-[#D4AF37] overflow-hidden">
              {user.picture ? (
                <img src={user.picture} alt="" className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full bg-[#D4AF37]/10 flex items-center justify-center">
                  <User size={32} className="text-[#D4AF37]" />
                </div>
              )}
            </div>
            <div className="flex-1">
              <h3 className="text-white font-bold text-lg">{user.name}</h3>
              <p className="text-[#A1A1AA] text-sm">{user.email}</p>
              {user.role === "admin" && (
                <Badge className="bg-[#D4AF37] text-black mt-1">مدير</Badge>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Admin Panel Link */}
      {user.role === "admin" && (
        <div className="px-4 py-2">
          <Button
            onClick={() => navigate("/admin")}
            className="w-full bg-[#D4AF37] hover:bg-[#F4C430] text-black font-bold rounded-xl h-12"
            data-testid="admin-panel-btn"
          >
            <Settings className="ml-2" />
            لوحة التحكم
          </Button>
        </div>
      )}

      {/* Menu Items */}
      <div className="px-4 py-4 space-y-2">
        {menuItems.map((item) => (
          <button
            key={item.path}
            onClick={() => navigate(item.path)}
            className="w-full flex items-center justify-between p-4 bg-[#121212] border border-[#27272A] rounded-xl hover:border-[#D4AF37]/50 transition-colors"
            data-testid={`menu-${item.label}`}
          >
            <div className="flex items-center gap-3">
              <item.icon size={20} className="text-[#D4AF37]" />
              <span className="text-white">{item.label}</span>
            </div>
            <div className="flex items-center gap-2">
              {item.count !== undefined && (
                <Badge className="bg-[#D4AF37] text-black">{item.count}</Badge>
              )}
              <ChevronLeft size={20} className="text-[#A1A1AA] flip-rtl" />
            </div>
          </button>
        ))}
      </div>

      {/* Logout */}
      <div className="px-4 py-4">
        <Button
          onClick={handleLogout}
          variant="outline"
          className="w-full border-red-500 text-red-500 hover:bg-red-500/10 rounded-xl h-12"
          data-testid="logout-btn"
        >
          <LogOut className="ml-2" />
          تسجيل الخروج
        </Button>
      </div>

      {/* Delete Account */}
      <div className="px-4 pb-4">
        <Button
          onClick={handleDeleteAccount}
          variant="outline"
          className="w-full border-red-700 text-red-700 hover:bg-red-700 hover:text-white rounded-xl h-12"
          data-testid="delete-account-btn"
        >
          <Trash2 className="ml-2" />
          حذف الحساب نهائياً
        </Button>
        <p className="text-[#666] text-xs text-center mt-2">
          سيتم حذف جميع بياناتك بشكل نهائي ولا يمكن استرجاعها
        </p>
      </div>

      <BottomNav />
    </div>
  );
};

export default ProfilePage;
