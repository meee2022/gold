import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { ArrowUp, ArrowDown, Calculator, Minus, Plus, ShoppingCart } from "lucide-react";
import { Button } from "../components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import { Badge } from "../components/ui/badge";
import { Input } from "../components/ui/input";
import { toast } from "sonner";
import { useAuth, apiCall, API } from "../context/AuthContext";
import { BottomNav, TopHeader } from "../components/Navigation";
import { PriceCard } from "../components/Cards";

function InvestmentPage() {
  const [prices, setPrices] = useState([]);
  const [bars, setBars] = useState([]);
  const [wallet, setWallet] = useState(null);
  const [transactions, setTransactions] = useState([]);
  const [shariaAccepted, setShariaAccepted] = useState(false);
  const [loading, setLoading] = useState(true);
  const [selectedWeight, setSelectedWeight] = useState("all");
  const navigate = useNavigate();
  const { user } = useAuth();

  // Calculator state
  const [selectedKarat, setSelectedKarat] = useState(24);
  const [quantity, setQuantity] = useState(10);

  useEffect(() => {
    fetchData();
  }, [user]);

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

  const handleBuy = async () => {
    if (!user) {
      navigate("/auth");
      return;
    }
    if (!shariaAccepted) {
      navigate("/sharia");
      return;
    }
    
    try {
      await apiCall("post", "/cart/add-gold", {
        karat: selectedKarat,
        grams: quantity,
        price_per_gram: selectedPrice
      });
      toast.success(`تمت إضافة ${quantity} جرام من عيار ${selectedKarat} للسلة`);
      // Navigate to cart
      navigate("/cart");
    } catch (error) {
      toast.error("فشل في إضافة الذهب للسلة");
    }
  };

  const handleAddBarToCart = async (bar) => {
    if (!user) {
      navigate("/auth");
      return;
    }
    if (!shariaAccepted) {
      navigate("/sharia");
      return;
    }
    
    try {
      await apiCall("post", "/cart/add", {
        product_id: bar.product_id,
        quantity: 1
      });
      toast.success(`تمت إضافة ${bar.title} للسلة`);
    } catch (error) {
      toast.error("فشل في إضافة المنتج للسلة");
    }
  };

  // Get price for selected karat
  const getKaratPrice = (karat) => {
    const priceData = prices.find(p => p.karat === karat);
    return priceData ? priceData.price_per_gram_qar : 0;
  };

  const selectedPrice = getKaratPrice(selectedKarat);
  const totalPrice = selectedPrice * quantity;

  const quickQuantities = [10, 50, 100, 500];
  const karatOptions = [
    { value: 24, label: "عيار 24" },
    { value: 22, label: "عيار 22" },
    { value: 21, label: "عيار 21" },
    { value: 18, label: "عيار 18" },
  ];

  const weightFilters = ["all", "10", "50", "100"];
  const filteredBars = selectedWeight === "all" 
    ? bars 
    : bars.filter(b => b.weight_grams === parseInt(selectedWeight));

  if (loading) {
    return (
      <div className="min-h-screen bg-[#050505] pb-20">
        <TopHeader title="الاستثمار" />
        <div className="p-4 space-y-4">
          {[1, 2, 3].map(i => <div key={i} className="skeleton h-32 rounded-xl" />)}
        </div>
        <BottomNav />
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

      {/* Gold Provider Section */}
      <div className="px-4 py-3" dir="rtl">
        <Card className="bg-gradient-to-br from-[#1A1A1A] to-[#0D0D0D] border-[#D4AF37]/30 overflow-hidden">
          <CardContent className="p-4">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 bg-[#D4AF37]/10 rounded-xl flex items-center justify-center border border-[#D4AF37]/30 flex-shrink-0">
                <img src="/logo.png" alt="مزود الذهب" className="w-12 h-12 object-contain" />
              </div>
              <div className="flex-1">
                <p className="text-[#A1A1AA] text-xs mb-1">مزود الذهب المعتمد</p>
                <h3 className="text-[#D4AF37] font-bold text-lg font-['Cairo']">زينة وخزينة للذهب</h3>
                <div className="flex items-center gap-2 mt-1">
                  <span className="bg-green-500/20 text-green-400 text-xs px-2 py-0.5 rounded-full">موثق ✓</span>
                  <span className="bg-[#D4AF37]/20 text-[#D4AF37] text-xs px-2 py-0.5 rounded-full">ذهب معتمد LBMA</span>
                </div>
              </div>
            </div>
            <div className="mt-4 pt-3 border-t border-[#27272A] grid grid-cols-3 gap-2 text-center">
              <div>
                <p className="text-[#D4AF37] font-bold">999.9</p>
                <p className="text-[#A1A1AA] text-xs">نقاء الذهب</p>
              </div>
              <div>
                <p className="text-[#D4AF37] font-bold">قطر</p>
                <p className="text-[#A1A1AA] text-xs">بلد المنشأ</p>
              </div>
              <div>
                <p className="text-[#D4AF37] font-bold">مرخص</p>
                <p className="text-[#A1A1AA] text-xs">حالة الترخيص</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Gold Calculator */}
      <div className="px-4 py-3">
        <Card className="bg-[#0D0D0D] border-[#27272A]">
          <CardHeader className="pb-2">
            <CardTitle className="text-[#D4AF37] font-['Cairo'] flex items-center gap-2 text-lg">
              <Calculator size={20} />
              حاسبة الذهب
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Karat Selection */}
            <div>
              <p className="text-white text-sm mb-2 text-right font-['Cairo']">اختر العيار</p>
              <div className="grid grid-cols-4 gap-2">
                {karatOptions.map((option) => {
                  const price = getKaratPrice(option.value);
                  const isSelected = selectedKarat === option.value;
                  return (
                    <button
                      key={option.value}
                      onClick={() => setSelectedKarat(option.value)}
                      className={`p-3 rounded-xl border-2 transition-all ${
                        isSelected 
                          ? "border-[#D4AF37] bg-[#D4AF37]/10" 
                          : "border-[#27272A] bg-[#121212] hover:border-[#D4AF37]/50"
                      }`}
                      data-testid={`karat-${option.value}`}
                    >
                      <p className={`font-bold text-sm ${isSelected ? "text-[#D4AF37]" : "text-white"}`}>
                        {option.label}
                      </p>
                      <p className="text-[#A1A1AA] text-xs mt-1">
                        {price.toFixed(2)} ر.ق/
                      </p>
                      <p className="text-[#A1A1AA] text-xs">جم</p>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Quantity Input */}
            <div>
              <p className="text-white text-sm mb-2 text-right font-['Cairo']">الكمية (بالجرام)</p>
              <div className="flex items-center gap-2">
                <Input
                  type="number"
                  value={quantity}
                  onChange={(e) => setQuantity(Math.max(1, parseInt(e.target.value) || 1))}
                  className="bg-[#121212] border-[#D4AF37]/50 text-white text-center text-2xl font-bold h-14 rounded-xl"
                  min="1"
                  data-testid="quantity-input"
                />
                <button
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  className="w-14 h-14 rounded-xl bg-[#1A1A1A] border border-[#27272A] flex items-center justify-center hover:bg-[#252525] transition-colors"
                  data-testid="decrease-quantity"
                >
                  <Minus size={20} className="text-white" />
                </button>
                <button
                  onClick={() => setQuantity(quantity + 1)}
                  className="w-14 h-14 rounded-xl bg-[#1A1A1A] border border-[#27272A] flex items-center justify-center hover:bg-[#252525] transition-colors"
                  data-testid="increase-quantity"
                >
                  <Plus size={20} className="text-white" />
                </button>
              </div>
            </div>

            {/* Quick Quantity Buttons */}
            <div className="flex gap-2">
              {quickQuantities.map((q) => (
                <button
                  key={q}
                  onClick={() => setQuantity(q)}
                  className={`flex-1 py-3 rounded-xl text-sm font-medium transition-all ${
                    quantity === q 
                      ? "bg-[#D4AF37] text-black" 
                      : "bg-[#1A1A1A] text-[#A1A1AA] border border-[#27272A] hover:border-[#D4AF37]/50"
                  }`}
                  data-testid={`quick-qty-${q}`}
                >
                  {q}جم
                </button>
              ))}
            </div>

            {/* Price Summary */}
            <div className="bg-[#121212] rounded-xl p-4 space-y-3 border border-[#27272A]">
              <div className="flex justify-between items-center">
                <span className="text-[#D4AF37] font-bold">{selectedPrice.toFixed(2)} ريال</span>
                <span className="text-white text-right font-['Cairo']">السعر للجرام</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-white">{quantity} جرام</span>
                <span className="text-white text-right font-['Cairo']">الكمية</span>
              </div>
              <div className="border-t border-[#27272A] pt-3">
                <div className="flex justify-between items-center">
                  <span className="text-[#D4AF37] font-bold text-2xl">{totalPrice.toFixed(2)} ريال</span>
                  <span className="text-white font-bold text-right font-['Cairo']">الإجمالي</span>
                </div>
              </div>
            </div>

            {/* Buy Button */}
            <Button 
              onClick={handleBuy}
              className="w-full bg-[#D4AF37] hover:bg-[#F4C430] text-black font-bold rounded-xl h-14 text-lg gold-glow"
              data-testid="buy-gold-calculator"
            >
              <ShoppingCart className="ml-2" size={20} />
              شراء الآن
            </Button>
          </CardContent>
        </Card>
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
              <Button onClick={() => handleAddBarToCart(bar)} className="bg-[#D4AF37] hover:bg-[#F4C430] text-black font-bold rounded-full self-center text-sm px-4" data-testid={`buy-bar-${bar.product_id}`}>
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
}

export default InvestmentPage;
