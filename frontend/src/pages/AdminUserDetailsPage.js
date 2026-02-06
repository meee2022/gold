import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Shield, User, Mail, Calendar, Package, Ban, CheckCircle } from "lucide-react";
import { Card, CardContent } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { Badge } from "../components/ui/badge";
import { toast } from "sonner";
import { useAuth } from "../context/AuthContext";
import { BottomNav, TopHeader } from "../components/Navigation";
import { fetchUserById, fetchUserOrders, updateUserRole, toggleUserBlock } from "../admin/usersApi";

const AdminUserDetailsPage = () => {
  const { id } = useParams();
  const [user, setUser] = useState(null);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const { user: currentUser } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!currentUser || currentUser.role !== "admin") {
      navigate("/");
      return;
    }
    loadUser();
    loadUserOrders();
  }, [currentUser, navigate, id]);

  const loadUser = async () => {
    try {
      const data = await fetchUserById(id);
      setUser(data);
    } catch (error) {
      toast.error("فشل في تحميل بيانات المستخدم");
      console.error(error);
      navigate("/admin/users");
    } finally {
      setLoading(false);
    }
  };

  const loadUserOrders = async () => {
    try {
      const data = await fetchUserOrders(id);
      setOrders(data || []);
    } catch (error) {
      console.error("Error loading user orders:", error);
    }
  };

  const handleToggleAdmin = async () => {
    const newRole = user.role === "admin" ? "customer" : "admin";
    const action = newRole === "admin" ? "منح" : "إزالة";
    
    if (!window.confirm(`هل أنت متأكد من ${action} صلاحيات الإدارة ${newRole === "admin" ? "لـ" : "من"} "${user.name}"؟`)) {
      return;
    }

    try {
      await updateUserRole(id, newRole);
      toast.success(`تم ${action} صلاحيات الإدارة بنجاح`);
      loadUser();
    } catch (error) {
      toast.error(`فشل في ${action} الصلاحيات`);
      console.error(error);
    }
  };

  const handleToggleBlock = async () => {
    const action = user.isBlocked ? "إلغاء حظر" : "حظر";
    
    if (!window.confirm(`هل أنت متأكد من ${action} المستخدم "${user.name}"؟`)) {
      return;
    }

    try {
      await toggleUserBlock(id, !user.isBlocked);
      toast.success(`تم ${action} المستخدم بنجاح`);
      loadUser();
    } catch (error) {
      toast.error(`فشل في ${action} المستخدم`);
      console.error(error);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#050505] pb-20">
        <TopHeader title="تفاصيل المستخدم" showBack />
        <div className="p-4 space-y-4">
          <div className="skeleton h-48 rounded-xl" />
          <div className="skeleton h-32 rounded-xl" />
        </div>
        <BottomNav />
      </div>
    );
  }

  if (!user) {
    return null;
  }

  const isCurrentUser = user.user_id === currentUser.user_id;

  return (
    <div className="min-h-screen bg-[#050505] pb-20">
      <TopHeader title="تفاصيل المستخدم" showBack showCart={false} showNotification={false} />

      <div className="px-4 py-4 space-y-4">
        {/* User Profile Card */}
        <Card className="bg-[#121212] border-[#27272A]">
          <CardContent className="p-4">
            <div className="flex flex-col items-center mb-4">
              {/* Avatar */}
              <div className="w-24 h-24 rounded-full overflow-hidden border-4 border-[#27272A] mb-3 bg-[#27272A] flex items-center justify-center">
                {user.picture ? (
                  <img
                    src={user.picture}
                    alt={user.name}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      e.target.style.display = 'none';
                    }}
                  />
                ) : (
                  <User className="h-12 w-12 text-[#A1A1AA]" />
                )}
              </div>

              {/* Name & Email */}
              <h2 className="text-white font-bold text-2xl mb-1 text-center">{user.name}</h2>
              <p className="text-[#A1A1AA] text-sm mb-3 break-all text-center">{user.email}</p>

              {/* Badges */}
              <div className="flex gap-2 flex-wrap justify-center">
                <Badge
                  className={
                    user.role === "admin"
                      ? "bg-purple-500/20 text-purple-400 border-purple-500/30"
                      : "bg-blue-500/20 text-blue-400 border-blue-500/30"
                  }
                >
                  {user.role === "admin" ? (
                    <>
                      <Shield className="h-3 w-3 ml-1" />
                      مسؤول
                    </>
                  ) : (
                    <>
                      <User className="h-3 w-3 ml-1" />
                      عميل
                    </>
                  )}
                </Badge>

                {user.isBlocked && (
                  <Badge className="bg-red-500/20 text-red-400 border-red-500/30">
                    <Ban className="h-3 w-3 ml-1" />
                    محظور
                  </Badge>
                )}

                {user.isVerified && (
                  <Badge className="bg-green-500/20 text-green-400 border-green-500/30">
                    <CheckCircle className="h-3 w-3 ml-1" />
                    موثق
                  </Badge>
                )}

                {isCurrentUser && (
                  <Badge className="bg-[#D4AF37]/20 text-[#D4AF37] border-[#D4AF37]/30">
                    أنت
                  </Badge>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* User Info Card */}
        <Card className="bg-[#121212] border-[#27272A]">
          <CardContent className="p-4 space-y-3">
            <h3 className="text-white font-semibold mb-2">معلومات الحساب</h3>

            <div className="flex items-center gap-3 text-[#A1A1AA]">
              <Mail className="h-5 w-5 text-[#D4AF37]" />
              <div>
                <p className="text-xs text-[#A1A1AA]">البريد الإلكتروني</p>
                <p className="text-white break-all">{user.email}</p>
              </div>
            </div>

            {user.createdAt && (
              <div className="flex items-center gap-3 text-[#A1A1AA]">
                <Calendar className="h-5 w-5 text-[#D4AF37]" />
                <div>
                  <p className="text-xs text-[#A1A1AA]">تاريخ التسجيل</p>
                  <p className="text-white">
                    {new Date(user.createdAt).toLocaleDateString("ar-QA", {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric'
                    })}
                  </p>
                </div>
              </div>
            )}

            {user.lastLogin && (
              <div className="flex items-center gap-3 text-[#A1A1AA]">
                <Calendar className="h-5 w-5 text-[#D4AF37]" />
                <div>
                  <p className="text-xs text-[#A1A1AA]">آخر تسجيل دخول</p>
                  <p className="text-white">
                    {new Date(user.lastLogin).toLocaleDateString("ar-QA")}
                  </p>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Orders Summary */}
        <Card className="bg-[#121212] border-[#27272A]">
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-white font-semibold">الطلبات</h3>
              <Badge className="bg-[#D4AF37]/20 text-[#D4AF37] border-[#D4AF37]/30">
                <Package className="h-3 w-3 ml-1" />
                {orders.length}
              </Badge>
            </div>

            {orders.length === 0 ? (
              <p className="text-[#A1A1AA] text-sm text-center py-4">
                لا توجد طلبات
              </p>
            ) : (
              <div className="space-y-2">
                {orders.slice(0, 5).map((order, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between p-2 bg-[#0A0A0A] rounded-lg"
                  >
                    <div>
                      <p className="text-white text-sm font-semibold">
                        طلب #{order.order_id?.slice(0, 8)}
                      </p>
                      <p className="text-[#A1A1AA] text-xs">
                        {new Date(order.createdAt).toLocaleDateString("ar-QA")}
                      </p>
                    </div>
                    <p className="text-[#D4AF37] font-bold">
                      {order.total_qar?.toLocaleString()} ر.ق
                    </p>
                  </div>
                ))}
                {orders.length > 5 && (
                  <p className="text-[#A1A1AA] text-xs text-center pt-2">
                    و {orders.length - 5} طلبات أخرى
                  </p>
                )}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Action Buttons */}
        {!isCurrentUser && (
          <div className="flex flex-col gap-3">
            <Button
              onClick={handleToggleAdmin}
              className={`w-full ${
                user.role === "admin"
                  ? "bg-orange-500 hover:bg-orange-600"
                  : "bg-purple-500 hover:bg-purple-600"
              } text-white font-semibold`}
            >
              <Shield className="ml-2 h-5 w-5" />
              {user.role === "admin" ? "إزالة صلاحيات الإدارة" : "منح صلاحيات الإدارة"}
            </Button>

            <Button
              onClick={handleToggleBlock}
              variant="outline"
              className={`w-full ${
                user.isBlocked
                  ? "border-green-500 text-green-500 hover:bg-green-500 hover:text-white"
                  : "border-red-500 text-red-500 hover:bg-red-500 hover:text-white"
              }`}
            >
              <Ban className="ml-2 h-5 w-5" />
              {user.isBlocked ? "إلغاء حظر المستخدم" : "حظر المستخدم"}
            </Button>
          </div>
        )}
      </div>

      <BottomNav />
    </div>
  );
};

export default AdminUserDetailsPage;
