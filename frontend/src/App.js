import { useState, useEffect, createContext, useContext, useRef } from "react";
import { BrowserRouter, Routes, Route, useNavigate, useLocation, Link } from "react-router-dom";
import axios from "axios";
import { Home, TrendingUp, Gift, Store, User, ShoppingBag, Bell, ChevronLeft, Search, Heart, Plus, Minus, X, Check, LogOut, Settings, Package, CreditCard, MapPin, Gem, CircleDollarSign, Menu, ArrowUp, ArrowDown, Sparkles } from "lucide-react";
import { Button } from "./components/ui/button";
import { Input } from "./components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "./components/ui/card";
import { Badge } from "./components/ui/badge";
import { Checkbox } from "./components/ui/checkbox";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./components/ui/tabs";
import { Toaster, toast } from "sonner";
import "./App.css";

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

// Auth Context
const AuthContext = createContext(null);

export const useAuth = () => useContext(AuthContext);

const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [token, setToken] = useState(localStorage.getItem("token"));

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    const savedToken = localStorage.getItem("token");
    if (savedToken) {
      try {
        const response = await axios.get(`${API}/auth/me`, {
          headers: { Authorization: `Bearer ${savedToken}` },
          withCredentials: true
        });
        setUser(response.data);
        setToken(savedToken);
      } catch (error) {
        localStorage.removeItem("token");
        setUser(null);
        setToken(null);
      }
    }
    setLoading(false);
  };

  const login = async (email, password) => {
    const response = await axios.post(`${API}/auth/login`, { email, password }, { withCredentials: true });
    localStorage.setItem("token", response.data.token);
    setToken(response.data.token);
    setUser(response.data.user);
    return response.data;
  };

  const register = async (name, email, password) => {
    const response = await axios.post(`${API}/auth/register`, { name, email, password }, { withCredentials: true });
    localStorage.setItem("token", response.data.token);
    setToken(response.data.token);
    setUser(response.data.user);
    return response.data;
  };

  const loginWithGoogle = () => {
    // REMINDER: DO NOT HARDCODE THE URL, OR ADD ANY FALLBACKS OR REDIRECT URLS, THIS BREAKS THE AUTH
    const redirectUrl = window.location.origin + '/auth/callback';
    window.location.href = `https://auth.emergentagent.com/?redirect=${encodeURIComponent(redirectUrl)}`;
  };

  const logout = async () => {
    try {
      await axios.post(`${API}/auth/logout`, {}, { withCredentials: true });
    } catch (e) {}
    localStorage.removeItem("token");
    setToken(null);
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, setUser, token, setToken, loading, login, register, loginWithGoogle, logout, checkAuth }}>
      {children}
    </AuthContext.Provider>
  );
};

// API helper with auth
const apiCall = async (method, endpoint, data = null) => {
  const token = localStorage.getItem("token");
  const config = {
    method,
    url: `${API}${endpoint}`,
    headers: token ? { Authorization: `Bearer ${token}` } : {},
    withCredentials: true,
    data
  };
  return axios(config);
};

// Bottom Navigation Component
const BottomNav = () => {
  const location = useLocation();
  const navigate = useNavigate();
  
  const navItems = [
    { path: "/", icon: Home, label: "الرئيسية" },
    { path: "/investment", icon: TrendingUp, label: "الاستثمار" },
    { path: "/gifts", icon: Gift, label: "الهدايا" },
    { path: "/store", icon: Store, label: "المتجر" },
    { path: "/profile", icon: User, label: "حسابي" },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-[#0A0A0A]/95 backdrop-blur-lg border-t border-[#27272A] h-16 flex items-center justify-around z-50 safe-area-inset-bottom" data-testid="bottom-nav">
      {navItems.map((item) => {
        const isActive = location.pathname === item.path || (item.path !== "/" && location.pathname.startsWith(item.path));
        return (
          <button
            key={item.path}
            onClick={() => navigate(item.path)}
            className={`flex flex-col items-center justify-center gap-1 px-4 py-2 transition-all ${isActive ? "text-[#D4AF37]" : "text-[#A1A1AA]"}`}
            data-testid={`nav-${item.label}`}
          >
            <item.icon size={22} className={isActive ? "text-[#D4AF37]" : ""} />
            <span className="text-xs font-medium">{item.label}</span>
            {isActive && <div className="w-1 h-1 rounded-full bg-[#D4AF37] mt-0.5" />}
          </button>
        );
      })}
    </nav>
  );
};

// Top Header Component
const TopHeader = ({ title, showBack = false, showCart = true, showNotification = true }) => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [cartCount, setCartCount] = useState(0);

  useEffect(() => {
    if (user) {
      apiCall("get", "/cart").then(res => {
        setCartCount(res.data.items?.length || 0);
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
          <button className="p-2 rounded-full hover:bg-[#1A1A1A] transition-colors relative" data-testid="notification-btn">
            <Bell size={22} className="text-[#A1A1AA]" />
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

// Price Card Component
const PriceCard = ({ karat, price, change, changePercent, isLive = true }) => {
  const isPositive = change >= 0;
  return (
    <div className="bg-[#121212] border border-[#27272A] rounded-xl p-3 min-w-[140px] flex-shrink-0" data-testid={`price-card-${karat}`}>
      <div className="flex items-center justify-between mb-2">
        <span className="text-[#A1A1AA] text-sm">عيار {karat} (ر.ق)</span>
        {isLive && <div className="w-2 h-2 rounded-full bg-green-500 pulse-live" />}
      </div>
      <div className="text-xl font-bold text-white">{price?.toFixed(2)}</div>
      <div className={`flex items-center gap-1 text-sm ${isPositive ? "text-green-500" : "text-red-500"}`}>
        {isPositive ? <ArrowUp size={14} /> : <ArrowDown size={14} />}
        <span>{isPositive ? "+" : ""}{changePercent?.toFixed(1)}%</span>
      </div>
    </div>
  );
};

// Product Card Component
const ProductCard = ({ product, onAddToCart }) => {
  const navigate = useNavigate();
  const [isFavorite, setIsFavorite] = useState(false);

  return (
    <div className="bg-[#121212] border border-[#27272A] rounded-xl overflow-hidden card-hover" data-testid={`product-${product.product_id}`}>
      <div className="relative aspect-square">
        <img src={product.image_url} alt={product.title} className="w-full h-full object-cover" />
        <button 
          onClick={(e) => { e.stopPropagation(); setIsFavorite(!isFavorite); }}
          className="absolute top-2 left-2 w-8 h-8 rounded-full bg-black/50 flex items-center justify-center"
          data-testid="favorite-btn"
        >
          <Heart size={16} className={isFavorite ? "fill-[#D4AF37] text-[#D4AF37]" : "text-white"} />
        </button>
        {product.karat && (
          <Badge className="absolute bottom-2 right-2 bg-[#D4AF37] text-black font-bold">
            عيار {product.karat}
          </Badge>
        )}
      </div>
      <div className="p-3">
        {product.merchant_name && (
          <span className="text-[#D4AF37] text-xs">{product.merchant_name}</span>
        )}
        <h3 className="text-white font-semibold text-sm mt-1 line-clamp-1">{product.title}</h3>
        <div className="flex items-center justify-between mt-2">
          <span className="text-[#D4AF37] font-bold">{product.price_qar?.toLocaleString()} ر.ق</span>
          <Button
            size="sm"
            onClick={(e) => { e.stopPropagation(); onAddToCart?.(product); }}
            className="bg-[#D4AF37] hover:bg-[#F4C430] text-black h-8 px-3 rounded-full"
            data-testid="add-to-cart-btn"
          >
            <Plus size={16} />
          </Button>
        </div>
      </div>
    </div>
  );
};

// Home Page
const HomePage = () => {
  const [prices, setPrices] = useState([]);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const { user } = useAuth();

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [pricesRes, productsRes] = await Promise.all([
        axios.get(`${API}/gold-prices`),
        axios.get(`${API}/products?type=jewelry`)
      ]);
      setPrices(pricesRes.data);
      setProducts(productsRes.data.slice(0, 4));
    } catch (error) {
      console.error(error);
    }
    setLoading(false);
  };

  const handleAddToCart = async (product) => {
    if (!user) {
      navigate("/auth");
      return;
    }
    try {
      await apiCall("post", "/cart/add", { product_id: product.product_id, quantity: 1 });
      toast.success("تمت الإضافة للسلة");
    } catch (error) {
      toast.error("فشل في الإضافة");
    }
  };

  const quickAccess = [
    { label: "الاستثمار", sublabel: "سبائك وعملات", icon: TrendingUp, path: "/investment", color: "bg-[#1A1A1A]" },
    { label: "المجوهرات", sublabel: "أطقم فاخرة", icon: Gem, path: "/store", color: "bg-[#1A1A1A]" },
    { label: "الهدايا", sublabel: "هدايا ذهبية", icon: Gift, path: "/gifts", color: "bg-[#1A1A1A]" },
  ];

  if (loading) {
    return (
      <div className="min-h-screen bg-[#050505] pb-20">
        <TopHeader />
        <div className="p-4 space-y-4">
          {[1, 2, 3].map(i => (
            <div key={i} className="skeleton h-24 rounded-xl" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#050505] pb-20" data-testid="home-page">
      <TopHeader />
      
      {/* Live Prices */}
      <div className="px-4 py-3">
        <div className="flex gap-3 overflow-x-auto hide-scrollbar pb-2">
          {prices.map((p) => (
            <PriceCard 
              key={p.karat} 
              karat={p.karat} 
              price={p.price_per_gram_qar} 
              change={p.change_amount}
              changePercent={p.change_percent}
            />
          ))}
        </div>
      </div>

      {/* Hero Banner */}
      <div className="px-4 py-2">
        <div className="relative rounded-2xl overflow-hidden h-44 bg-gradient-to-br from-[#1A1A1A] to-[#0A0A0A] border border-[#27272A]" data-testid="hero-banner">
          <img 
            src="https://images.unsplash.com/photo-1624365169364-0640dd10e180?w=800" 
            alt="Gold" 
            className="absolute inset-0 w-full h-full object-cover opacity-40"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent" />
          <div className="absolute bottom-0 right-0 p-5 text-right">
            <h2 className="text-2xl font-bold text-[#D4AF37] font-['Cairo'] mb-1">زينة وخزينة</h2>
            <p className="text-[#A1A1AA] text-sm mb-3">منصة قطرية لتجارة الذهب بكل أمان وسهولة</p>
            <Button 
              onClick={() => navigate("/investment")}
              className="bg-[#D4AF37] hover:bg-[#F4C430] text-black font-bold rounded-full px-6 gold-glow"
              data-testid="start-investment-btn"
            >
              ابدأ الاستثمار
            </Button>
          </div>
        </div>
      </div>

      {/* Quick Access */}
      <div className="px-4 py-4">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-lg font-bold text-white font-['Cairo']">الوصول السريع</h3>
          <button className="text-[#D4AF37] text-sm">عرض الكل</button>
        </div>
        <div className="flex gap-3 overflow-x-auto hide-scrollbar">
          {quickAccess.map((item) => (
            <button
              key={item.path}
              onClick={() => navigate(item.path)}
              className="flex flex-col items-center gap-2 min-w-[100px] p-4 bg-[#121212] border border-[#27272A] rounded-xl hover:border-[#D4AF37]/50 transition-colors"
              data-testid={`quick-${item.label}`}
            >
              <div className="w-12 h-12 rounded-full bg-[#D4AF37]/10 flex items-center justify-center">
                <item.icon size={24} className="text-[#D4AF37]" />
              </div>
              <span className="text-white text-sm font-medium">{item.label}</span>
              <span className="text-[#A1A1AA] text-xs">{item.sublabel}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Market Updates */}
      <div className="px-4 py-4">
        <h3 className="text-lg font-bold text-white font-['Cairo'] mb-3">آخر تحديثات السوق</h3>
        <div className="space-y-2">
          {prices.slice(0, 3).map((p) => (
            <div key={p.karat} className="flex items-center justify-between p-3 bg-[#121212] border border-[#27272A] rounded-xl">
              <div className="flex items-center gap-3">
                <div className="w-2 h-2 rounded-full bg-green-500 pulse-live" />
                <span className="text-white">ذهب عيار {p.karat}</span>
              </div>
              <div className="text-left">
                <span className="text-white font-bold">{p.price_per_gram_qar?.toFixed(2)} ر.ق</span>
                <span className={`text-sm mr-2 ${p.change_amount >= 0 ? "text-green-500" : "text-red-500"}`}>
                  {p.change_amount >= 0 ? "+" : ""}{p.change_amount}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Featured Products */}
      {products.length > 0 && (
        <div className="px-4 py-4">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-lg font-bold text-white font-['Cairo']">منتجات مميزة</h3>
            <button onClick={() => navigate("/store")} className="text-[#D4AF37] text-sm">عرض الكل</button>
          </div>
          <div className="grid grid-cols-2 gap-3">
            {products.map((product) => (
              <ProductCard key={product.product_id} product={product} onAddToCart={handleAddToCart} />
            ))}
          </div>
        </div>
      )}

      <BottomNav />
    </div>
  );
};

// Investment Page
const InvestmentPage = () => {
  const [prices, setPrices] = useState([]);
  const [bars, setBars] = useState([]);
  const [wallet, setWallet] = useState(null);
  const [transactions, setTransactions] = useState([]);
  const [shariaAccepted, setShariaAccepted] = useState(false);
  const [loading, setLoading] = useState(true);
  const [selectedWeight, setSelectedWeight] = useState("all");
  const navigate = useNavigate();
  const { user } = useAuth();

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [pricesRes, barsRes] = await Promise.all([
        axios.get(`${API}/gold-prices`),
        axios.get(`${API}/products?type=investment_bar`)
      ]);
      setPrices(pricesRes.data);
      setBars(barsRes.data);
      
      if (user) {
        const [walletRes, txRes, shariaRes] = await Promise.all([
          apiCall("get", "/wallet"),
          apiCall("get", "/transactions"),
          apiCall("get", "/sharia-acceptance")
        ]);
        setWallet(walletRes.data);
        setTransactions(txRes.data);
        setShariaAccepted(shariaRes.data.accepted);
      }
    } catch (error) {
      console.error(error);
    }
    setLoading(false);
  };

  const handleBuy = () => {
    if (!user) {
      navigate("/auth");
      return;
    }
    if (!shariaAccepted) {
      navigate("/sharia");
      return;
    }
    // Navigate to buy flow
    toast.info("سيتم إضافة ميزة الشراء قريباً");
  };

  const weightFilters = ["all", "10", "50", "100"];
  const filteredBars = selectedWeight === "all" 
    ? bars 
    : bars.filter(b => b.weight_grams === parseInt(selectedWeight));

  if (loading) {
    return (
      <div className="min-h-screen bg-[#050505] pb-20">
        <TopHeader title="الاستثمار" showBack />
        <div className="p-4 space-y-4">
          {[1, 2, 3].map(i => <div key={i} className="skeleton h-32 rounded-xl" />)}
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#050505] pb-20" data-testid="investment-page">
      <TopHeader title="الاستثمار" />

      {/* Price Header */}
      <div className="px-4 py-3">
        <div className="flex gap-3 overflow-x-auto hide-scrollbar">
          {prices.map((p) => (
            <PriceCard 
              key={p.karat} 
              karat={p.karat} 
              price={p.price_per_gram_qar}
              change={p.change_amount}
              changePercent={p.change_percent}
            />
          ))}
        </div>
      </div>

      {/* My Wallet */}
      {user && wallet && (
        <div className="px-4 py-3">
          <Card className="bg-gradient-to-br from-[#1A1A1A] to-[#0A0A0A] border-[#27272A]">
            <CardHeader className="pb-2">
              <CardTitle className="text-[#D4AF37] font-['Cairo']">محفظتي الذهبية</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex justify-between items-center mb-4">
                <div>
                  <p className="text-[#A1A1AA] text-sm">إجمالي الذهب</p>
                  <p className="text-2xl font-bold text-white">{wallet.gold_grams_total?.toFixed(2)} جرام</p>
                </div>
                <div className="text-left">
                  <p className="text-[#A1A1AA] text-sm">القيمة التقديرية</p>
                  <p className="text-xl font-bold text-[#D4AF37]">
                    {((wallet.gold_grams_total || 0) * (prices[0]?.price_per_gram_qar || 0)).toFixed(2)} ر.ق
                  </p>
                </div>
              </div>
              <div className="flex gap-2">
                <Button onClick={handleBuy} className="flex-1 bg-[#D4AF37] hover:bg-[#F4C430] text-black font-bold rounded-full" data-testid="buy-gold-btn">
                  شراء ذهب
                </Button>
                <Button variant="outline" className="flex-1 border-[#D4AF37] text-[#D4AF37] hover:bg-[#D4AF37]/10 rounded-full" data-testid="sell-gold-btn">
                  بيع الذهب
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Weight Filters */}
      <div className="px-4 py-2">
        <div className="flex gap-2 overflow-x-auto hide-scrollbar">
          {weightFilters.map((w) => (
            <Button
              key={w}
              variant={selectedWeight === w ? "default" : "outline"}
              onClick={() => setSelectedWeight(w)}
              className={`rounded-full ${selectedWeight === w ? "bg-[#D4AF37] text-black" : "border-[#27272A] text-[#A1A1AA]"}`}
              data-testid={`filter-${w}`}
            >
              {w === "all" ? "الكل" : `${w} جرام`}
            </Button>
          ))}
        </div>
      </div>

      {/* Gold Bars */}
      <div className="px-4 py-3">
        <h3 className="text-lg font-bold text-white font-['Cairo'] mb-3">السبائك المتوفرة</h3>
        <div className="space-y-3">
          {filteredBars.map((bar) => (
            <div key={bar.product_id} className="flex gap-4 p-4 bg-[#121212] border border-[#27272A] rounded-xl" data-testid={`bar-${bar.product_id}`}>
              <img src={bar.image_url} alt={bar.title} className="w-20 h-20 rounded-lg object-cover" />
              <div className="flex-1">
                <h4 className="text-white font-semibold">{bar.title}</h4>
                <p className="text-[#A1A1AA] text-sm">النقاء: {bar.karat === 24 ? "999.9" : bar.karat}</p>
                <p className="text-[#D4AF37] font-bold mt-1">{bar.price_qar?.toLocaleString()} ر.ق</p>
              </div>
              <Button onClick={handleBuy} className="bg-[#D4AF37] hover:bg-[#F4C430] text-black font-bold rounded-full self-center" data-testid={`buy-bar-${bar.product_id}`}>
                اشترِ الآن
              </Button>
            </div>
          ))}
        </div>
      </div>

      {/* Recent Transactions */}
      {user && transactions.length > 0 && (
        <div className="px-4 py-3">
          <h3 className="text-lg font-bold text-white font-['Cairo'] mb-3">آخر المعاملات</h3>
          <div className="space-y-2">
            {transactions.slice(0, 5).map((tx) => (
              <div key={tx.transaction_id} className="flex items-center justify-between p-3 bg-[#121212] border border-[#27272A] rounded-xl">
                <div className="flex items-center gap-3">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center ${tx.type === "buy" ? "bg-green-500/10" : "bg-red-500/10"}`}>
                    {tx.type === "buy" ? <ArrowDown className="text-green-500" /> : <ArrowUp className="text-red-500" />}
                  </div>
                  <div>
                    <p className="text-white">{tx.type === "buy" ? "شراء" : "بيع"}</p>
                    <p className="text-[#A1A1AA] text-sm">{tx.grams} جرام</p>
                  </div>
                </div>
                <div className="text-left">
                  <p className={tx.type === "buy" ? "text-red-500" : "text-green-500"}>
                    {tx.type === "buy" ? "-" : "+"}{tx.price_qar?.toLocaleString()} ر.ق
                  </p>
                  <Badge variant={tx.status === "completed" ? "default" : "secondary"} className="text-xs">
                    {tx.status === "completed" ? "مكتمل" : "قيد التنفيذ"}
                  </Badge>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      <BottomNav />
    </div>
  );
};

// Gifts Page
const GiftsPage = () => {
  const [products, setProducts] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [selectedCard, setSelectedCard] = useState(null);
  const [customMessage, setCustomMessage] = useState("");
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const { user } = useAuth();

  const categories = [
    { id: "all", label: "الكل", icon: "💝" },
    { id: "أعراس", label: "الأعراس", icon: "💍" },
    { id: "مواليد", label: "المواليد", icon: "👶" },
    { id: "نجاح", label: "النجاح", icon: "🎓" },
  ];

  const greetings = [
    "دامت أفراحكم",
    "مبارك ما رزقتم",
    "تستحق كل خير",
    "بارك الله لكما",
    "ألف مبروك"
  ];

  useEffect(() => {
    fetchGifts();
  }, []);

  const fetchGifts = async () => {
    try {
      const response = await axios.get(`${API}/products?type=gift`);
      setProducts(response.data);
    } catch (error) {
      console.error(error);
    }
    setLoading(false);
  };

  const filteredProducts = selectedCategory === "all" 
    ? products 
    : products.filter(p => p.category === selectedCategory);

  const handleAddToCart = async (product) => {
    if (!user) {
      navigate("/auth");
      return;
    }
    try {
      await apiCall("post", "/cart/add", { product_id: product.product_id, quantity: 1 });
      toast.success("تمت الإضافة للسلة");
      setSelectedCard(null);
    } catch (error) {
      toast.error("فشل في الإضافة");
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#050505] pb-20">
        <TopHeader title="الهدايا" />
        <div className="p-4 grid grid-cols-2 gap-3">
          {[1, 2, 3, 4].map(i => <div key={i} className="skeleton aspect-square rounded-xl" />)}
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#050505] pb-20" data-testid="gifts-page">
      <TopHeader title="الهدايا" />

      {/* Categories */}
      <div className="px-4 py-3">
        <div className="flex gap-2 overflow-x-auto hide-scrollbar">
          {categories.map((cat) => (
            <Button
              key={cat.id}
              variant={selectedCategory === cat.id ? "default" : "outline"}
              onClick={() => setSelectedCategory(cat.id)}
              className={`rounded-full flex items-center gap-2 ${selectedCategory === cat.id ? "bg-[#D4AF37] text-black" : "border-[#27272A] text-[#A1A1AA]"}`}
              data-testid={`category-${cat.id}`}
            >
              <span>{cat.icon}</span>
              <span>{cat.label}</span>
            </Button>
          ))}
        </div>
      </div>

      {/* Gift Cards */}
      <div className="px-4 py-2">
        <h3 className="text-lg font-bold text-white font-['Cairo'] mb-3">مناسباتكم السعيدة</h3>
        <p className="text-[#A1A1AA] text-sm mb-4">اختر نوع المناسبة لتصفح التصاميم</p>
        <div className="grid grid-cols-2 gap-3">
          {filteredProducts.map((product) => (
            <div 
              key={product.product_id}
              onClick={() => setSelectedCard(product)}
              className="bg-[#121212] border border-[#27272A] rounded-xl overflow-hidden cursor-pointer hover:border-[#D4AF37]/50 transition-colors"
              data-testid={`gift-${product.product_id}`}
            >
              <div className="aspect-square relative">
                <img src={product.image_url} alt={product.title} className="w-full h-full object-cover" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                <div className="absolute bottom-2 right-2 left-2">
                  <p className="text-white font-semibold text-sm">{product.title}</p>
                  <p className="text-[#D4AF37] font-bold">{product.price_qar?.toLocaleString()} ر.ق</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Gift Card Selection Modal */}
      {selectedCard && (
        <div className="fixed inset-0 bg-black/80 z-50 flex items-end justify-center" onClick={() => setSelectedCard(null)}>
          <div 
            className="bg-[#0A0A0A] w-full max-w-md rounded-t-3xl p-6 max-h-[80vh] overflow-y-auto"
            onClick={e => e.stopPropagation()}
            data-testid="gift-modal"
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold text-white font-['Cairo']">اختيار عبارة التهنئة</h3>
              <button onClick={() => setSelectedCard(null)} className="p-2">
                <X className="text-[#A1A1AA]" />
              </button>
            </div>

            {/* Card Preview */}
            <div className="relative rounded-xl overflow-hidden mb-4 border border-[#D4AF37]/30">
              <img src={selectedCard.image_url} alt="" className="w-full aspect-video object-cover opacity-60" />
              <div className="absolute inset-0 flex items-center justify-center bg-black/40">
                <div className="text-center p-4">
                  <p className="text-[#D4AF37] font-bold text-xl font-['Cairo']">{customMessage || "بارك الله لكما"}</p>
                  <p className="text-white/80 text-sm mt-2">{selectedCard.title}</p>
                </div>
              </div>
            </div>

            {/* Custom Message Input */}
            <div className="mb-4">
              <label className="text-white text-sm mb-2 block">أو اكتب رسالتك الخاصة</label>
              <Input
                value={customMessage}
                onChange={(e) => setCustomMessage(e.target.value)}
                placeholder="اكتب تهنئتك الخاصة هنا لتمتزج بلمعان الذهب..."
                className="bg-[#1A1A1A] border-[#27272A] text-white text-right"
                data-testid="custom-message-input"
              />
            </div>

            {/* Quick Greetings */}
            <div className="mb-4">
              <p className="text-[#A1A1AA] text-sm mb-2">مقترحات سريعة</p>
              <div className="flex flex-wrap gap-2">
                {greetings.map((g) => (
                  <Button
                    key={g}
                    variant="outline"
                    size="sm"
                    onClick={() => setCustomMessage(g)}
                    className="border-[#27272A] text-[#A1A1AA] hover:border-[#D4AF37] hover:text-[#D4AF37] rounded-full"
                    data-testid={`greeting-${g}`}
                  >
                    {g}
                  </Button>
                ))}
              </div>
            </div>

            {/* Add to Cart */}
            <Button 
              onClick={() => handleAddToCart(selectedCard)}
              className="w-full bg-[#D4AF37] hover:bg-[#F4C430] text-black font-bold rounded-full h-12"
              data-testid="confirm-gift-btn"
            >
              <Check className="ml-2" />
              تأكيد الاختيار
            </Button>
          </div>
        </div>
      )}

      <BottomNav />
    </div>
  );
};

// Store Page
const StorePage = () => {
  const [activeTab, setActiveTab] = useState("jewelry");
  const [merchants, setMerchants] = useState([]);
  const [products, setProducts] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const navigate = useNavigate();
  const { user } = useAuth();

  const jewelryCategories = [
    { id: "all", label: "الكل", icon: Gem },
    { id: "خواتم", label: "الخواتم", icon: CircleDollarSign },
    { id: "سلاسل", label: "السلاسل", icon: Sparkles },
    { id: "أساور", label: "الأساور", icon: CircleDollarSign },
    { id: "أقراط", label: "الأقراط", icon: Sparkles },
  ];

  useEffect(() => {
    fetchData();
  }, [activeTab]);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [merchantsRes, productsRes] = await Promise.all([
        axios.get(`${API}/merchants`),
        axios.get(`${API}/products?type=${activeTab}`)
      ]);
      setMerchants(merchantsRes.data);
      setProducts(productsRes.data);
    } catch (error) {
      console.error(error);
    }
    setLoading(false);
  };

  const handleAddToCart = async (product) => {
    if (!user) {
      navigate("/auth");
      return;
    }
    try {
      await apiCall("post", "/cart/add", { product_id: product.product_id, quantity: 1 });
      toast.success("تمت الإضافة للسلة");
    } catch (error) {
      toast.error("فشل في الإضافة");
    }
  };

  const filteredProducts = products.filter(p => {
    const matchesCategory = selectedCategory === "all" || p.category === selectedCategory;
    const matchesSearch = !searchQuery || p.title.includes(searchQuery);
    return matchesCategory && matchesSearch;
  });

  return (
    <div className="min-h-screen bg-[#050505] pb-20" data-testid="store-page">
      <TopHeader title="المتجر" />

      {/* Search */}
      <div className="px-4 py-3">
        <div className="relative">
          <Search className="absolute right-3 top-1/2 -translate-y-1/2 text-[#A1A1AA]" size={20} />
          <Input
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="ابحث عن مجوهرات أو متاجر..."
            className="bg-[#1A1A1A] border-[#27272A] text-white pr-10 h-12 rounded-full"
            data-testid="search-input"
          />
        </div>
      </div>

      {/* Tabs */}
      <div className="px-4">
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="bg-[#121212] border border-[#27272A] w-full">
            <TabsTrigger value="jewelry" className="flex-1 data-[state=active]:bg-[#D4AF37] data-[state=active]:text-black" data-testid="tab-jewelry">
              المجوهرات
            </TabsTrigger>
            <TabsTrigger value="qatari" className="flex-1 data-[state=active]:bg-[#D4AF37] data-[state=active]:text-black" data-testid="tab-qatari">
              المنتجات القطرية
            </TabsTrigger>
          </TabsList>
        </Tabs>
      </div>

      {/* Trusted Merchants */}
      <div className="px-4 py-4">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-lg font-bold text-white font-['Cairo']">المحلات الموثوقة</h3>
          <button className="text-[#D4AF37] text-sm">عرض الكل</button>
        </div>
        <div className="flex gap-4 overflow-x-auto hide-scrollbar">
          {merchants.map((m) => (
            <div key={m.merchant_id} className="flex flex-col items-center gap-2 min-w-[70px]" data-testid={`merchant-${m.merchant_id}`}>
              <div className="w-16 h-16 rounded-full border-2 border-[#D4AF37]/30 overflow-hidden">
                <img src={m.logo_url} alt={m.name} className="w-full h-full object-cover" />
              </div>
              <span className="text-white text-xs text-center">{m.name}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Categories - Only for Jewelry */}
      {activeTab === "jewelry" && (
        <div className="px-4 py-2">
          <h3 className="text-lg font-bold text-white font-['Cairo'] mb-3">تصنيفات المصوغات</h3>
          <div className="flex gap-3 overflow-x-auto hide-scrollbar">
            {jewelryCategories.map((cat) => (
              <button
                key={cat.id}
                onClick={() => setSelectedCategory(cat.id)}
                className={`flex flex-col items-center gap-2 min-w-[70px] p-3 rounded-xl transition-colors ${selectedCategory === cat.id ? "bg-[#D4AF37] text-black" : "bg-[#121212] border border-[#27272A] text-[#A1A1AA]"}`}
                data-testid={`cat-${cat.id}`}
              >
                <cat.icon size={24} />
                <span className="text-xs">{cat.label}</span>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Products */}
      <div className="px-4 py-4">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-lg font-bold text-white font-['Cairo']">
            {activeTab === "jewelry" ? "المجوهرات المختارة" : "المنتجات القطرية"}
          </h3>
        </div>
        
        {loading ? (
          <div className="grid grid-cols-2 gap-3">
            {[1, 2, 3, 4].map(i => <div key={i} className="skeleton aspect-square rounded-xl" />)}
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-3">
            {filteredProducts.map((product) => (
              <ProductCard key={product.product_id} product={product} onAddToCart={handleAddToCart} />
            ))}
          </div>
        )}
      </div>

      <BottomNav />
    </div>
  );
};

// Cart Page
const CartPage = () => {
  const [cart, setCart] = useState({ items: [], total: 0 });
  const [loading, setLoading] = useState(true);
  const [couponCode, setCouponCode] = useState("");
  const navigate = useNavigate();
  const { user } = useAuth();

  useEffect(() => {
    if (user) {
      fetchCart();
    } else {
      setLoading(false);
    }
  }, [user]);

  const fetchCart = async () => {
    try {
      const response = await apiCall("get", "/cart");
      setCart(response.data);
    } catch (error) {
      console.error(error);
    }
    setLoading(false);
  };

  const updateQuantity = async (productId, quantity) => {
    try {
      await apiCall("put", "/cart/update", { product_id: productId, quantity });
      fetchCart();
    } catch (error) {
      toast.error("فشل في التحديث");
    }
  };

  const removeItem = async (productId) => {
    try {
      await apiCall("delete", `/cart/remove/${productId}`);
      fetchCart();
      toast.success("تم الحذف");
    } catch (error) {
      toast.error("فشل في الحذف");
    }
  };

  const handleCheckout = async () => {
    try {
      const response = await apiCall("post", "/orders", { items: cart.items, coupon_code: couponCode });
      toast.success("تم إنشاء الطلب بنجاح");
      navigate("/orders");
    } catch (error) {
      toast.error(error.response?.data?.detail || "فشل في إنشاء الطلب");
    }
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-[#050505] pb-20">
        <TopHeader title="سلة التسوق" showBack showCart={false} />
        <div className="flex flex-col items-center justify-center h-[60vh] px-4">
          <ShoppingBag size={64} className="text-[#27272A] mb-4" />
          <p className="text-[#A1A1AA] mb-4">يرجى تسجيل الدخول لعرض سلة التسوق</p>
          <Button onClick={() => navigate("/auth")} className="bg-[#D4AF37] hover:bg-[#F4C430] text-black rounded-full">
            تسجيل الدخول
          </Button>
        </div>
        <BottomNav />
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-[#050505] pb-20">
        <TopHeader title="سلة التسوق" showBack showCart={false} />
        <div className="p-4 space-y-4">
          {[1, 2].map(i => <div key={i} className="skeleton h-24 rounded-xl" />)}
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#050505] pb-32" data-testid="cart-page">
      <TopHeader title="سلة التسوق" showBack showCart={false} />

      {/* Live Price Notice */}
      <div className="px-4 py-3">
        <div className="flex items-center gap-2 text-[#D4AF37] text-sm">
          <div className="w-2 h-2 rounded-full bg-green-500 pulse-live" />
          <span>الأسعار محدثة مباشرة بناءً على سعر الذهب العالمي</span>
        </div>
      </div>

      {cart.items.length === 0 ? (
        <div className="flex flex-col items-center justify-center h-[50vh] px-4">
          <ShoppingBag size={64} className="text-[#27272A] mb-4" />
          <p className="text-[#A1A1AA] mb-4">سلة التسوق فارغة</p>
          <Button onClick={() => navigate("/store")} className="bg-[#D4AF37] hover:bg-[#F4C430] text-black rounded-full">
            تسوق الآن
          </Button>
        </div>
      ) : (
        <>
          {/* Cart Items */}
          <div className="px-4 space-y-3">
            {cart.items.map((item) => (
              <div key={item.product_id} className="flex gap-3 p-3 bg-[#121212] border border-[#27272A] rounded-xl" data-testid={`cart-item-${item.product_id}`}>
                <img src={item.product?.image_url} alt="" className="w-20 h-20 rounded-lg object-cover" />
                <div className="flex-1">
                  <div className="flex items-start justify-between">
                    <div>
                      <h4 className="text-white font-semibold text-sm">{item.product?.title}</h4>
                      <p className="text-[#A1A1AA] text-xs">المورد: {item.product?.merchant_name}</p>
                      {item.product?.weight_grams && (
                        <p className="text-[#A1A1AA] text-xs">الوزن: {item.product.weight_grams} جرام</p>
                      )}
                    </div>
                    <button onClick={() => removeItem(item.product_id)} className="p-1">
                      <X size={18} className="text-[#A1A1AA]" />
                    </button>
                  </div>
                  <div className="flex items-center justify-between mt-2">
                    <span className="text-[#D4AF37] font-bold">{item.product?.price_qar?.toLocaleString()} ر.ق</span>
                    <div className="flex items-center gap-2 bg-[#1A1A1A] rounded-full p-1">
                      <button 
                        onClick={() => updateQuantity(item.product_id, item.quantity - 1)}
                        className="w-7 h-7 rounded-full bg-[#D4AF37] text-black flex items-center justify-center"
                        data-testid="decrease-qty"
                      >
                        <Minus size={14} />
                      </button>
                      <span className="text-white w-6 text-center">{item.quantity}</span>
                      <button 
                        onClick={() => updateQuantity(item.product_id, item.quantity + 1)}
                        className="w-7 h-7 rounded-full bg-[#D4AF37] text-black flex items-center justify-center"
                        data-testid="increase-qty"
                      >
                        <Plus size={14} />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Coupon */}
          <div className="px-4 py-4">
            <div className="flex gap-2">
              <Input
                value={couponCode}
                onChange={(e) => setCouponCode(e.target.value)}
                placeholder="رمز القسيمة"
                className="bg-[#1A1A1A] border-[#D4AF37]/30 text-white flex-1"
                data-testid="coupon-input"
              />
              <Button className="bg-[#D4AF37]/20 text-[#D4AF37] border border-[#D4AF37] hover:bg-[#D4AF37] hover:text-black rounded-lg" data-testid="apply-coupon">
                تطبيق
              </Button>
            </div>
          </div>

          {/* Order Summary */}
          <div className="px-4 py-2">
            <h3 className="text-lg font-bold text-white font-['Cairo'] mb-3">ملخص الطلب</h3>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-[#A1A1AA]">المجموع الفرعي</span>
                <span className="text-white">{cart.total?.toLocaleString()} ر.ق</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#A1A1AA]">رسوم التوصيل (الدوحة)</span>
                <span className="text-green-500">مجاني</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#A1A1AA]">ضريبة القيمة المضافة</span>
                <span className="text-white">0 ر.ق</span>
              </div>
              <div className="border-t border-[#27272A] pt-2 mt-2">
                <div className="flex justify-between">
                  <span className="text-white font-bold">الإجمالي النهائي</span>
                  <span className="text-[#D4AF37] font-bold text-lg">{cart.total?.toLocaleString()} ر.ق</span>
                </div>
              </div>
            </div>
          </div>
        </>
      )}

      {/* Fixed Checkout Button */}
      {cart.items.length > 0 && (
        <div className="fixed bottom-0 left-0 right-0 bg-[#0A0A0A] border-t border-[#27272A] p-4">
          <div className="flex items-center justify-between mb-3">
            <div>
              <span className="text-[#A1A1AA] text-sm">إجمالي العناصر ({cart.items.length})</span>
              <p className="text-[#D4AF37] font-bold">{cart.total?.toLocaleString()} ر.ق</p>
            </div>
            <div className="flex items-center gap-1 text-green-500 text-xs">
              <CreditCard size={14} />
              <span>دفع آمن 100%</span>
            </div>
          </div>
          <Button 
            onClick={handleCheckout}
            className="w-full bg-[#D4AF37] hover:bg-[#F4C430] text-black font-bold rounded-full h-12 gold-glow"
            data-testid="checkout-btn"
          >
            <CreditCard className="ml-2" />
            إتمام عملية الشراء
          </Button>
        </div>
      )}
    </div>
  );
};

// Sharia Compliance Page
const ShariaPage = () => {
  const [accepted, setAccepted] = useState(false);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { user } = useAuth();

  const handleAccept = async () => {
    if (!accepted) {
      toast.error("يرجى الموافقة على الشروط الشرعية");
      return;
    }
    
    setLoading(true);
    try {
      await apiCall("post", "/sharia-acceptance", { accepted: true });
      toast.success("تم حفظ الموافقة");
      navigate("/investment");
    } catch (error) {
      toast.error("فشل في حفظ الموافقة");
    }
    setLoading(false);
  };

  if (!user) {
    navigate("/auth");
    return null;
  }

  return (
    <div className="min-h-screen bg-[#FAFAFA] pb-20" data-testid="sharia-page">
      {/* Header */}
      <div className="bg-[#0A0A0A] px-4 py-3 flex items-center gap-3">
        <button onClick={() => navigate(-1)} className="p-2">
          <ChevronLeft size={24} className="text-white flip-rtl" />
        </button>
        <h1 className="text-white font-bold font-['Cairo']">اتفاقية التقابض والشروط الشرعية</h1>
      </div>

      <div className="p-4">
        {/* Icon */}
        <div className="flex justify-center py-6">
          <div className="w-20 h-20 rounded-full bg-[#D4AF37]/20 flex items-center justify-center">
            <Check size={40} className="text-[#D4AF37]" />
          </div>
        </div>

        {/* Title */}
        <h2 className="text-2xl font-bold text-[#0A0A0A] text-center font-['Cairo'] mb-2">
          الالتزام بالشريعة الإسلامية
        </h2>
        <p className="text-[#666] text-center text-sm mb-6">
          تتم جميع المعاملات في "زينة وخزينة" وفقاً للضوابط الشرعية المعتمدة لتجارة الذهب والمجوهرات لضمان خلوها من الربا والغرر.
        </p>

        {/* Terms Cards */}
        <div className="space-y-3 mb-6">
          <Card className="bg-white border-[#E5E5E5]">
            <CardContent className="p-4 flex gap-4">
              <div className="w-12 h-12 rounded-xl bg-[#D4AF37]/10 flex items-center justify-center flex-shrink-0">
                <TrendingUp className="text-[#D4AF37]" />
              </div>
              <div>
                <h3 className="font-bold text-[#0A0A0A] font-['Cairo']">التقابض يداً بيد</h3>
                <p className="text-[#666] text-sm">يتم إتمام عملية البيع والشراء فورياً (Spot Trade) لضمان التقابض الشرعي المعتبر في الذهب والفضة.</p>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white border-[#E5E5E5]">
            <CardContent className="p-4 flex gap-4">
              <div className="w-12 h-12 rounded-xl bg-[#D4AF37]/10 flex items-center justify-center flex-shrink-0">
                <Package className="text-[#D4AF37]" />
              </div>
              <div>
                <h3 className="font-bold text-[#0A0A0A] font-['Cairo']">التملك المباشر</h3>
                <p className="text-[#666] text-sm">تنتقل ملكية الذهب للمشتري فور إتمام عملية الدفع، مع ضمان الحق في استلام الذهب مادياً أو تخزينه في خزائن مؤمنة.</p>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white border-[#E5E5E5]">
            <CardContent className="p-4 flex gap-4">
              <div className="w-12 h-12 rounded-xl bg-[#D4AF37]/10 flex items-center justify-center flex-shrink-0">
                <ArrowUp className="text-[#D4AF37]" />
              </div>
              <div>
                <h3 className="font-bold text-[#0A0A0A] font-['Cairo']">شفافية الأسعار</h3>
                <p className="text-[#666] text-sm">يتم تحديث الأسعار لحظياً بناءً على أسعار البورصة العالمية للذهب، مع وضوح كامل في التكاليف والرسوم.</p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Agreement Checkbox */}
        <div className="flex items-start gap-3 mb-6 p-4 bg-white rounded-xl border border-[#E5E5E5]">
          <Checkbox
            id="sharia-accept"
            checked={accepted}
            onCheckedChange={setAccepted}
            className="mt-1 data-[state=checked]:bg-[#D4AF37] data-[state=checked]:border-[#D4AF37]"
            data-testid="sharia-checkbox"
          />
          <label htmlFor="sharia-accept" className="text-[#0A0A0A] text-sm cursor-pointer">
            لقد قرأت الشروط الشرعية وأوافق على ما ورد فيها
          </label>
        </div>

        {/* Accept Button */}
        <Button
          onClick={handleAccept}
          disabled={loading || !accepted}
          className="w-full bg-[#D4AF37] hover:bg-[#F4C430] text-black font-bold rounded-full h-12 disabled:opacity-50"
          data-testid="accept-sharia-btn"
        >
          {loading ? "جاري الحفظ..." : "موافق والاستمرار"}
        </Button>

        {/* Additional Terms */}
        <div className="mt-6 space-y-2 text-[#666] text-sm">
          <p>1. يقر العميل بأن كافة العمليات التي تتم عبر منصة زينة وخزينة هي عمليات بيع وشراء ناجزة وفورية.</p>
          <p>2. يلتزم الطرفان بأن يتم سداد كامل القيمة فوراً عبر وسائل الدفع المتاحة، ويعتبر قيد المبلغ في حساب الشركة تقابضاً حكمياً معتبراً.</p>
          <p>3. الذهب المعروض للبيع هو ملك خالص لشركة زينة وخزينة أو في حيازتها القانونية قبل عرضها للبيع.</p>
          <p>4. يتم تحديد وزن وعيار الذهب بدقة متناهية وفقاً للمقاييس العالمية.</p>
        </div>
      </div>
    </div>
  );
};

// Auth Page
const AuthPage = () => {
  const [mode, setMode] = useState("login");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { login, register, loginWithGoogle, user } = useAuth();

  useEffect(() => {
    if (user) {
      navigate("/");
    }
  }, [user, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      if (mode === "login") {
        await login(email, password);
      } else {
        await register(name, email, password);
      }
      toast.success(mode === "login" ? "تم تسجيل الدخول بنجاح" : "تم إنشاء الحساب بنجاح");
      navigate("/");
    } catch (error) {
      toast.error(error.response?.data?.detail || "حدث خطأ");
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-[#050505] flex flex-col" data-testid="auth-page">
      {/* Header */}
      <div className="p-4">
        <button onClick={() => navigate("/")} className="p-2">
          <ChevronLeft size={24} className="text-[#D4AF37] flip-rtl" />
        </button>
      </div>

      {/* Content */}
      <div className="flex-1 px-6 py-8">
        {/* Logo */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-[#D4AF37] font-['Cairo']">زينة وخزينة</h1>
          <p className="text-[#A1A1AA] text-sm mt-2">ZEINA & KHAZINA</p>
        </div>

        {/* Google Login */}
        <Button
          onClick={loginWithGoogle}
          className="w-full bg-white hover:bg-gray-100 text-black font-medium rounded-full h-12 mb-4 flex items-center justify-center gap-3"
          data-testid="google-login-btn"
        >
          <svg width="20" height="20" viewBox="0 0 24 24">
            <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
            <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
            <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
            <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
          </svg>
          المتابعة مع Google
        </Button>

        {/* Divider */}
        <div className="flex items-center gap-4 my-6">
          <div className="flex-1 h-px bg-[#27272A]" />
          <span className="text-[#A1A1AA] text-sm">أو</span>
          <div className="flex-1 h-px bg-[#27272A]" />
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {mode === "register" && (
            <div>
              <label className="text-white text-sm mb-2 block">الاسم</label>
              <Input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="أدخل اسمك"
                required
                className="bg-[#1A1A1A] border-[#27272A] text-white h-12 rounded-xl"
                data-testid="name-input"
              />
            </div>
          )}

          <div>
            <label className="text-white text-sm mb-2 block">البريد الإلكتروني</label>
            <Input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="example@email.com"
              required
              className="bg-[#1A1A1A] border-[#27272A] text-white h-12 rounded-xl"
              data-testid="email-input"
            />
          </div>

          <div>
            <label className="text-white text-sm mb-2 block">كلمة المرور</label>
            <Input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              required
              className="bg-[#1A1A1A] border-[#27272A] text-white h-12 rounded-xl"
              data-testid="password-input"
            />
          </div>

          <Button
            type="submit"
            disabled={loading}
            className="w-full bg-[#D4AF37] hover:bg-[#F4C430] text-black font-bold rounded-full h-12 gold-glow"
            data-testid="submit-auth-btn"
          >
            {loading ? "جاري التحميل..." : mode === "login" ? "تسجيل الدخول" : "إنشاء حساب"}
          </Button>
        </form>

        {/* Toggle Mode */}
        <p className="text-center mt-6 text-[#A1A1AA]">
          {mode === "login" ? "ليس لديك حساب؟" : "لديك حساب بالفعل؟"}
          <button
            onClick={() => setMode(mode === "login" ? "register" : "login")}
            className="text-[#D4AF37] font-bold mr-2"
            data-testid="toggle-auth-mode"
          >
            {mode === "login" ? "إنشاء حساب" : "تسجيل الدخول"}
          </button>
        </p>
      </div>
    </div>
  );
};

// Auth Callback Page
const AuthCallback = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { setUser, setToken } = useAuth();
  const hasProcessed = useRef(false);

  useEffect(() => {
    if (hasProcessed.current) return;
    hasProcessed.current = true;

    const processSession = async () => {
      const hash = location.hash;
      const sessionId = hash.split("session_id=")[1]?.split("&")[0];

      if (!sessionId) {
        navigate("/auth");
        return;
      }

      try {
        const response = await axios.post(`${API}/auth/session`, { session_id: sessionId }, { withCredentials: true });
        localStorage.setItem("token", response.data.token);
        setToken(response.data.token);
        setUser(response.data.user);
        navigate("/", { replace: true });
      } catch (error) {
        console.error("Auth callback error:", error);
        toast.error("فشل في تسجيل الدخول");
        navigate("/auth");
      }
    };

    processSession();
  }, []);

  return (
    <div className="min-h-screen bg-[#050505] flex items-center justify-center">
      <div className="text-center">
        <div className="w-12 h-12 border-4 border-[#D4AF37] border-t-transparent rounded-full animate-spin mx-auto mb-4" />
        <p className="text-[#A1A1AA]">جاري تسجيل الدخول...</p>
      </div>
    </div>
  );
};

// Profile Page
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

      <BottomNav />
    </div>
  );
};

// Orders Page
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

// Admin Page
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

// App Router
function AppRouter() {
  const location = useLocation();

  // Check URL fragment for session_id (Emergent OAuth callback)
  if (location.hash?.includes('session_id=')) {
    return <AuthCallback />;
  }

  return (
    <Routes>
      <Route path="/" element={<HomePage />} />
      <Route path="/investment" element={<InvestmentPage />} />
      <Route path="/gifts" element={<GiftsPage />} />
      <Route path="/store" element={<StorePage />} />
      <Route path="/cart" element={<CartPage />} />
      <Route path="/sharia" element={<ShariaPage />} />
      <Route path="/auth" element={<AuthPage />} />
      <Route path="/auth/callback" element={<AuthCallback />} />
      <Route path="/profile" element={<ProfilePage />} />
      <Route path="/orders" element={<OrdersPage />} />
      <Route path="/admin" element={<AdminPage />} />
      <Route path="*" element={<HomePage />} />
    </Routes>
  );
}

function App() {
  return (
    <AuthProvider>
      <div className="App" dir="rtl">
        <Toaster position="top-center" richColors />
        <BrowserRouter>
          <AppRouter />
        </BrowserRouter>
      </div>
    </AuthProvider>
  );
}

export default App;
