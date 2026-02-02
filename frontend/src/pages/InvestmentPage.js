import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { ArrowUp, ArrowDown } from "lucide-react";
import { Button } from "../components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import { Badge } from "../components/ui/badge";
import { toast } from "sonner";
import { useAuth, apiCall, API } from "../context/AuthContext";
import { BottomNav, TopHeader } from "../components/Navigation";
import { PriceCard } from "../components/Cards";

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

  const handleBuy = () => {
    if (!user) {
      navigate("/auth");
      return;
    }
    if (!shariaAccepted) {
      navigate("/sharia");
      return;
    }
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

export default InvestmentPage;
