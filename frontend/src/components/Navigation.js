import { useLocation, useNavigate } from "react-router-dom";
import { Home, TrendingUp, Gift, Store, User, ShoppingCart, ShoppingBag, Bell, ChevronLeft, Wallet } from "lucide-react";
import { useAuth, apiCall } from "../context/AuthContext";
import { useState, useEffect } from "react";

// Bottom Navigation Component
export const BottomNav = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [cartCount, setCartCount] = useState(0);

  useEffect(() => {
    if (user) {
      apiCall("get", "/cart").then(res => {
        setCartCount(res.data.items?.length || 0);
      }).catch(() => {});
    }
  }, [user, location.pathname]);
  
  const navItems = [
    { path: "/", icon: Home, label: "الرئيسية" },
    { path: "/investment", icon: TrendingUp, label: "الاستثمار" },
    { path: "/portfolio", icon: Wallet, label: "المحفظة" },
    { path: "/gifts", icon: Gift, label: "الهدايا" },
    { path: "/store", icon: Store, label: "المتجر" },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-[#0A0A0A]/95 backdrop-blur-lg border-t border-[#27272A] h-16 flex items-center justify-around z-50 safe-area-inset-bottom" data-testid="bottom-nav">
      {navItems.map((item) => {
        const isActive = location.pathname === item.path || (item.path !== "/" && location.pathname.startsWith(item.path));
        return (
          <button
            key={item.path}
            onClick={() => navigate(item.path)}
            className={`flex flex-col items-center justify-center gap-0.5 px-2 py-1 transition-all relative ${isActive ? "text-[#D4AF37]" : "text-[#A1A1AA]"}`}
            data-testid={`nav-${item.label}`}
          >
            <div className="relative">
              <item.icon size={20} className={isActive ? "text-[#D4AF37]" : ""} />
            </div>
            <span className="text-[10px] font-medium">{item.label}</span>
            {isActive && <div className="w-1 h-1 rounded-full bg-[#D4AF37] mt-0.5" />}
          </button>
        );
      })}
    </nav>
  );
};

// Top Header Component
export const TopHeader = ({ title, showBack = false, showCart = true, showNotification = true }) => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [cartCount, setCartCount] = useState(0);
  const [notifCount, setNotifCount] = useState(0);

  useEffect(() => {
    if (user) {
      apiCall("get", "/cart").then(res => {
        setCartCount(res.data.items?.length || 0);
      }).catch(() => {});
      
      apiCall("get", "/notifications").then(res => {
        setNotifCount(res.data.unread_count || 0);
      }).catch(() => {});
    }
  }, [user]);

  return (
    <header className="sticky top-0 z-40 bg-[#0A0A0A]/90 backdrop-blur-md border-b border-[#27272A] px-4 py-3 flex items-center justify-between" data-testid="top-header">
      <div className="flex items-center gap-3">
        {showBack && (
          <button onClick={() => navigate(-1)} className="p-2 rounded-full hover:bg-[#1A1A1A] transition-colors flip-rtl" data-testid="back-btn">
            <ChevronLeft size={24} className="text-[#D4AF37]" />
          </button>
        )}
        {!showBack && (
          <button onClick={() => navigate("/profile")} className="w-10 h-10 rounded-full bg-[#1A1A1A] flex items-center justify-center border border-[#27272A]" data-testid="profile-btn">
            {user?.picture ? (
              <img src={user.picture} alt="" className="w-full h-full rounded-full object-cover" />
            ) : (
              <User size={20} className="text-[#D4AF37]" />
            )}
          </button>
        )}
      </div>
      
      <h1 className="text-lg font-bold text-[#D4AF37] font-['Cairo']" data-testid="header-title">
        {title || "زينة وخزينة"}
      </h1>
      
      <div className="flex items-center gap-2">
        {showNotification && (
          <button onClick={() => navigate("/notifications")} className="p-2 rounded-full hover:bg-[#1A1A1A] transition-colors relative" data-testid="notification-btn">
            <Bell size={22} className="text-[#A1A1AA]" />
            {notifCount > 0 && (
              <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-xs font-bold rounded-full flex items-center justify-center">
                {notifCount}
              </span>
            )}
          </button>
        )}
        {showCart && (
          <button onClick={() => navigate("/cart")} className="p-2 rounded-full hover:bg-[#1A1A1A] transition-colors relative" data-testid="cart-btn">
            <ShoppingBag size={22} className="text-[#A1A1AA]" />
            {cartCount > 0 && (
              <span className="absolute -top-1 -right-1 w-5 h-5 bg-[#D4AF37] text-black text-xs font-bold rounded-full flex items-center justify-center">
                {cartCount}
              </span>
            )}
          </button>
        )}
      </div>
    </header>
  );
};
