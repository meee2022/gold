import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { TrendingUp, TrendingDown, Wallet, Gift, ArrowUpRight, ArrowDownRight, RefreshCw } from "lucide-react";
import { Button } from "../components/ui/button";
import { Badge } from "../components/ui/badge";
import { toast } from "sonner";
import { useAuth, apiCall } from "../context/AuthContext";
import { BottomNav, TopHeader } from "../components/Navigation";

const PortfolioPage = () => {
  const [portfolio, setPortfolio] = useState([]);
  const [stats, setStats] = useState({
    totalValue: 0,
    totalCost: 0,
    profitLoss: 0,
    profitLossPercent: 0,
  });
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const navigate = useNavigate();
  const { user } = useAuth();

  useEffect(() => {
    if (!user) {
      navigate("/auth");
      return;
    }
    fetchPortfolio();
  }, [user]);

  const fetchPortfolio = async () => {
    try {
      setRefreshing(true);
      const response = await apiCall("get", "/portfolio");
      
      if (!response.data || response.data.length === 0) {
        // No portfolio items - show empty state
        setPortfolio([]);
        setStats({
          totalValue: 0,
          totalCost: 0,
          profitLoss: 0,
          profitLossPercent: 0,
        });
      } else {
        setPortfolio(response.data.items || []);
        setStats(response.data.stats || {
          totalValue: 0,
          totalCost: 0,
          profitLoss: 0,
          profitLossPercent: 0,
        });
      }
    } catch (error) {
      console.error("Error fetching portfolio:", error);
      // Show empty state on error
      setPortfolio([]);
      toast.info("قم بإضافة هدايا أو شراء سبائك لبناء محفظتك الاستثمارية");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const handleRefresh = () => {
    fetchPortfolio();
    toast.success("تم تحديث المحفظة!");
  };

  const handleSellItem = async (itemId) => {
    try {
      await apiCall("post", `/portfolio/${itemId}/sell`);
      toast.success("تم بيع المنتج بنجاح!");
      fetchPortfolio();
    } catch (error) {
      toast.error("فشل في بيع المنتج");
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#050505] pb-20">
        <TopHeader title="محفظة الاستثمار" />
        <div className="p-4 space-y-4">
          {[1, 2, 3].map(i => (
            <div key={i} className="skeleton h-32 rounded-xl" />
          ))}
        </div>
        <BottomNav />
      </div>
    );
  }

  const isProfit = stats.profitLoss >= 0;

  return (
    <div className="min-h-screen bg-[#050505] pb-20">
      <TopHeader title="محفظة الاستثمار" />

      <div className="p-4 space-y-4">
        {/* Stats Card */}
        <div className="bg-gradient-to-br from-[#1A1A1A] to-[#0A0A0A] border-2 border-[#D4AF37]/30 rounded-2xl p-5">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Wallet className="text-[#D4AF37]" size={24} />
              <h2 className="text-white font-bold text-lg">إجمالي المحفظة</h2>
            </div>
            <Button
              onClick={handleRefresh}
              disabled={refreshing}
              size="sm"
              variant="outline"
              className="border-[#27272A] text-[#A1A1AA] hover:text-white"
            >
              <RefreshCw className={`ml-1 ${refreshing ? 'animate-spin' : ''}`} size={16} />
              تحديث
            </Button>
          </div>

          <div className="space-y-3">
            <div>
              <p className="text-[#A1A1AA] text-sm mb-1">القيمة الحالية</p>
              <p className="text-[#D4AF37] text-3xl font-bold">
                {stats.totalValue.toLocaleString()} ر.ق
              </p>
            </div>

            <div className="flex items-center justify-between pt-3 border-t border-[#27272A]">
              <div>
                <p className="text-[#A1A1AA] text-xs">تكلفة الشراء</p>
                <p className="text-white font-semibold">{stats.totalCost.toLocaleString()} ر.ق</p>
              </div>
              
              <div className="text-right">
                <p className="text-[#A1A1AA] text-xs">الربح/الخسارة</p>
                <div className={`flex items-center gap-1 ${isProfit ? 'text-green-400' : 'text-red-400'}`}>
                  {isProfit ? <ArrowUpRight size={16} /> : <ArrowDownRight size={16} />}
                  <span className="font-bold">
                    {isProfit ? '+' : ''}{stats.profitLoss.toLocaleString()} ر.ق
                  </span>
                  <span className="text-xs">
                    ({isProfit ? '+' : ''}{stats.profitLossPercent.toFixed(1)}%)
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Portfolio Items */}
        {portfolio.length === 0 ? (
          <div className="bg-[#1A1A1A] border border-[#27272A] rounded-2xl p-8 text-center">
            <Wallet className="text-[#A1A1AA] mx-auto mb-4" size={64} />
            <h3 className="text-white font-bold text-lg mb-2">محفظتك فارغة</h3>
            <p className="text-[#A1A1AA] text-sm mb-6">
              ابدأ الاستثمار في الذهب الآن! قم بشراء سبائك أو احفظ الهدايا التي تصلك
            </p>
            <div className="flex gap-3 justify-center">
              <Button
                onClick={() => navigate("/investment")}
                className="bg-[#D4AF37] hover:bg-[#F4C430] text-black font-bold rounded-full"
              >
                <TrendingUp className="ml-2" size={18} />
                شراء سبائك
              </Button>
              <Button
                onClick={() => navigate("/gifts")}
                variant="outline"
                className="border-[#D4AF37] text-[#D4AF37] hover:bg-[#D4AF37] hover:text-black rounded-full"
              >
                <Gift className="ml-2" size={18} />
                إرسال هدية
              </Button>
            </div>
          </div>
        ) : (
          <div className="space-y-3">
            <h3 className="text-white font-bold text-lg flex items-center gap-2">
              <TrendingUp className="text-[#D4AF37]" size={20} />
              استثماراتك ({portfolio.length})
            </h3>

            {portfolio.map((item) => {
              const itemProfit = item.current_value - item.purchase_price;
              const itemProfitPercent = (itemProfit / item.purchase_price) * 100;
              const isItemProfit = itemProfit >= 0;

              return (
                <div 
                  key={item.id}
                  className="bg-[#1A1A1A] border border-[#27272A] rounded-xl p-4 hover:border-[#D4AF37]/50 transition-colors"
                >
                  <div className="flex items-start gap-4">
                    {/* Image */}
                    <div className="w-20 h-20 rounded-lg overflow-hidden border border-[#27272A] flex-shrink-0">
                      <img 
                        src={item.image_url || "https://via.placeholder.com/100"} 
                        alt={item.title}
                        className="w-full h-full object-cover"
                      />
                    </div>

                    {/* Details */}
                    <div className="flex-1">
                      <div className="flex items-start justify-between mb-2">
                        <div>
                          <h4 className="text-white font-semibold text-sm">{item.title}</h4>
                          <p className="text-[#A1A1AA] text-xs mt-1">
                            {item.weight_grams} جرام • {item.karat} عيار
                          </p>
                        </div>
                        {item.source === "gift" && (
                          <Badge className="bg-purple-500/20 text-purple-400 border-purple-500/30">
                            <Gift size={12} className="ml-1" />
                            هدية
                          </Badge>
                        )}
                      </div>

                      {/* Prices */}
                      <div className="flex items-center justify-between mt-3">
                        <div>
                          <p className="text-[#A1A1AA] text-xs">القيمة الحالية</p>
                          <p className="text-[#D4AF37] font-bold">
                            {item.current_value.toLocaleString()} ر.ق
                          </p>
                        </div>

                        <div className="text-right">
                          <p className="text-[#A1A1AA] text-xs">الربح/الخسارة</p>
                          <p className={`font-semibold text-sm ${isItemProfit ? 'text-green-400' : 'text-red-400'}`}>
                            {isItemProfit ? '+' : ''}{itemProfit.toFixed(2)} ر.ق
                            <span className="text-xs ml-1">
                              ({isItemProfit ? '+' : ''}{itemProfitPercent.toFixed(1)}%)
                            </span>
                          </p>
                        </div>
                      </div>

                      {/* Actions */}
                      <div className="flex gap-2 mt-3">
                        <Button
                          onClick={() => handleSellItem(item.id)}
                          size="sm"
                          className="flex-1 bg-[#D4AF37] hover:bg-[#F4C430] text-black font-bold rounded-lg h-8"
                        >
                          بيع الآن
                        </Button>
                        <Button
                          onClick={() => navigate(`/send-gift/${item.product_id}`)}
                          size="sm"
                          variant="outline"
                          className="flex-1 border-[#27272A] text-white hover:bg-[#1A1A1A] rounded-lg h-8"
                        >
                          <Gift size={14} className="ml-1" />
                          إهداء
                        </Button>
                      </div>
                    </div>
                  </div>

                  {/* Purchase Info */}
                  <div className="mt-3 pt-3 border-t border-[#27272A] flex items-center justify-between text-xs text-[#A1A1AA]">
                    <span>تاريخ الإضافة: {new Date(item.added_at || Date.now()).toLocaleDateString("ar-QA")}</span>
                    <span>سعر الشراء: {item.purchase_price.toLocaleString()} ر.ق</span>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      <BottomNav />
    </div>
  );
};

export default PortfolioPage;
