import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Bell, Check, CheckCheck, Trash2, TrendingUp, ChevronLeft } from "lucide-react";
import { Button } from "../components/ui/button";
import { toast } from "sonner";
import { useAuth, apiCall } from "../context/AuthContext";
import { BottomNav } from "../components/Navigation";

const NotificationsPage = () => {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const { user } = useAuth();

  useEffect(() => {
    if (user) {
      fetchNotifications();
    }
  }, [user]);

  const fetchNotifications = async () => {
    try {
      const response = await apiCall("get", "/notifications");
      setNotifications(response.data.notifications || []);
    } catch (error) {
      console.error(error);
    }
    setLoading(false);
  };

  const markAsRead = async (notificationId) => {
    try {
      await apiCall("put", `/notifications/${notificationId}/read`);
      setNotifications(prev => 
        prev.map(n => n.notification_id === notificationId ? {...n, read: true} : n)
      );
    } catch (error) {
      toast.error("حدث خطأ");
    }
  };

  const markAllAsRead = async () => {
    try {
      await apiCall("post", "/notifications/mark-all-read");
      setNotifications(prev => prev.map(n => ({...n, read: true})));
      toast.success("تم تحديث جميع الإشعارات");
    } catch (error) {
      toast.error("حدث خطأ");
    }
  };

  const getNotificationIcon = (type) => {
    switch (type) {
      case "price_alert":
        return <TrendingUp size={20} className="text-[#D4AF37]" />;
      default:
        return <Bell size={20} className="text-[#D4AF37]" />;
    }
  };

  const formatDate = (dateStr) => {
    const date = new Date(dateStr);
    const now = new Date();
    const diff = now - date;
    
    if (diff < 60000) return "الآن";
    if (diff < 3600000) return `منذ ${Math.floor(diff / 60000)} دقيقة`;
    if (diff < 86400000) return `منذ ${Math.floor(diff / 3600000)} ساعة`;
    return date.toLocaleDateString("ar-QA");
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-[#050505] pb-20">
        <div className="bg-[#0A0A0A] px-4 py-3 flex items-center gap-3 border-b border-[#27272A]">
          <button onClick={() => navigate(-1)} className="p-2">
            <ChevronLeft size={24} className="text-[#D4AF37] flip-rtl" />
          </button>
          <h1 className="text-[#D4AF37] font-bold font-['Cairo']">الإشعارات</h1>
        </div>
        <div className="flex flex-col items-center justify-center h-[60vh] px-4">
          <Bell size={64} className="text-[#27272A] mb-4" />
          <p className="text-[#A1A1AA] mb-4">يرجى تسجيل الدخول لرؤية الإشعارات</p>
          <Button onClick={() => navigate("/auth")} className="bg-[#D4AF37] hover:bg-[#F4C430] text-black rounded-full">
            تسجيل الدخول
          </Button>
        </div>
        <BottomNav />
      </div>
    );
  }

  const unreadCount = notifications.filter(n => !n.read).length;

  return (
    <div className="min-h-screen bg-[#050505] pb-20" data-testid="notifications-page">
      {/* Header */}
      <div className="bg-[#0A0A0A] px-4 py-3 flex items-center justify-between border-b border-[#27272A]">
        <div className="flex items-center gap-3">
          <button onClick={() => navigate(-1)} className="p-2">
            <ChevronLeft size={24} className="text-[#D4AF37] flip-rtl" />
          </button>
          <h1 className="text-[#D4AF37] font-bold font-['Cairo']">الإشعارات</h1>
          {unreadCount > 0 && (
            <span className="bg-[#D4AF37] text-black text-xs font-bold px-2 py-0.5 rounded-full">
              {unreadCount}
            </span>
          )}
        </div>
        {unreadCount > 0 && (
          <button onClick={markAllAsRead} className="text-[#D4AF37] text-sm flex items-center gap-1">
            <CheckCheck size={16} />
            قراءة الكل
          </button>
        )}
      </div>

      {/* Notifications List */}
      <div className="p-4">
        {loading ? (
          <div className="space-y-3">
            {[1, 2, 3].map(i => (
              <div key={i} className="skeleton h-20 rounded-xl" />
            ))}
          </div>
        ) : notifications.length === 0 ? (
          <div className="text-center py-16">
            <Bell size={48} className="text-[#27272A] mx-auto mb-4" />
            <p className="text-[#A1A1AA]">لا توجد إشعارات</p>
          </div>
        ) : (
          <div className="space-y-3">
            {notifications.map((notification) => (
              <div
                key={notification.notification_id}
                onClick={() => !notification.read && markAsRead(notification.notification_id)}
                className={`p-4 rounded-xl border transition-all cursor-pointer ${
                  notification.read 
                    ? "bg-[#0A0A0A] border-[#1A1A1A]" 
                    : "bg-[#121212] border-[#27272A] hover:border-[#D4AF37]/30"
                }`}
                data-testid={`notification-${notification.notification_id}`}
              >
                <div className="flex gap-3">
                  <div className="w-10 h-10 rounded-full bg-[#D4AF37]/10 flex items-center justify-center flex-shrink-0">
                    {getNotificationIcon(notification.type)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <h3 className={`font-bold font-['Cairo'] ${notification.read ? "text-[#A1A1AA]" : "text-white"}`}>
                        {notification.title}
                      </h3>
                      {!notification.read && (
                        <div className="w-2 h-2 rounded-full bg-[#D4AF37] flex-shrink-0 mt-2" />
                      )}
                    </div>
                    <p className="text-[#A1A1AA] text-sm mt-1">{notification.message}</p>
                    <p className="text-[#666] text-xs mt-2">{formatDate(notification.created_at)}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <BottomNav />
    </div>
  );
};

export default NotificationsPage;
