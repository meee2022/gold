import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { ChevronLeft, ChevronRight, RefreshCw, Gift, Banknote, Send, Wallet, Shield, HelpCircle, Award } from "lucide-react";
import { Button } from "../components/ui/button";
import { toast } from "sonner";
import { useAuth, apiCall } from "../context/AuthContext";
import { BottomNav } from "../components/Navigation";

const ReceivedGiftPage = () => {
  const navigate = useNavigate();
  const { giftId } = useParams();
  const { user } = useAuth();
  const [gift, setGift] = useState(null);
  const [goldPrice, setGoldPrice] = useState(0);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    fetchGiftDetails();
    fetchGoldPrice();
  }, [giftId]);

  const fetchGiftDetails = async () => {
    try {
      // For demo, using sample data
      // In production, fetch from API: await apiCall("get", `/gifts/received/${giftId}`)
      setGift({
        gift_id: giftId || "gift_001",
        sender_name: "فهد الكواري",
        type: "سبيكة ذهب",
        karat: 24,
        weight_grams: 10,
        received_at: new Date().toISOString(),
        image_url: "https://images.unsplash.com/photo-1610375461246-83df859d849d?w=600",
        message: "هدية بمناسبة التخرج"
      });
    } catch (error) {
      toast.error("فشل في تحميل بيانات الهدية");
    }
    setLoading(false);
  };

  const fetchGoldPrice = async () => {
    setRefreshing(true);
    try {
      const response = await apiCall("get", "/gold-prices");
      const price24k = response.data.find(p => p.karat === 24);
      if (price24k) {
        setGoldPrice(price24k.price_per_gram_qar);
      }
    } catch (error) {
      console.error("Failed to fetch gold price");
    }
    setRefreshing(false);
  };

  const currentValue = gift ? (goldPrice * gift.weight_grams).toFixed(2) : 0;

  const handleSellGift = () => {
    toast.success("سيتم التحويل لحسابك خلال 24 ساعة");
    // In production: await apiCall("post", `/gifts/${giftId}/sell`)
  };

  const handleRegift = () => {
    navigate(`/gifts/send?from_gift=${giftId}`);
  };

  const handleAddToPortfolio = () => {
    toast.success("تمت إضافة الهدية لمحفظة الاستثمار");
    // In production: await apiCall("post", `/wallet/add-gift`, { gift_id: giftId })
  };

  const handleViewCertificate = () => {
    toast.info("شهادة الملكية الرقمية");
    // In production: open certificate modal or page
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#050505] flex items-center justify-center">
        <div className="w-10 h-10 border-4 border-[#D4AF37] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#050505] pb-24" data-testid="received-gift-page">
      {/* Header */}
      <div className="bg-[#0A0A0A] px-4 py-3 flex items-center justify-between border-b border-[#27272A]">
        <button onClick={() => navigate(-1)} className="p-2 text-[#D4AF37]">
          <ChevronRight size={24} />
        </button>
        <h1 className="text-[#D4AF37] font-bold font-['Cairo'] text-lg">إدارة الهدية المستلمة</h1>
        <button className="p-2 text-[#A1A1AA]">
          <HelpCircle size={22} />
        </button>
      </div>

      <div className="p-4 space-y-4">
        {/* Live Gold Price */}
        <div className="bg-[#121212] border border-[#27272A] rounded-xl p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-[#D4AF37]/20 flex items-center justify-center">
                <span className="text-[#D4AF37] text-lg">📈</span>
              </div>
              <div>
                <p className="text-[#A1A1AA] text-sm">سعر الذهب مباشر (عيار 24)</p>
                <p className="text-[#D4AF37] font-bold text-xl font-['Cairo']">{goldPrice.toFixed(2)} ر.ق / جرام</p>
              </div>
            </div>
          </div>
          <button 
            onClick={fetchGoldPrice}
            disabled={refreshing}
            className="flex items-center gap-2 text-[#D4AF37] text-sm mt-3 hover:underline"
          >
            <RefreshCw size={14} className={refreshing ? "animate-spin" : ""} />
            تحديث الآن
          </button>
        </div>

        {/* Gift Card */}
        <div className="bg-[#121212] border border-[#27272A] rounded-2xl overflow-hidden">
          {/* Gift Image */}
          <div className="relative h-48">
            <img 
              src={gift.image_url} 
              alt={gift.type}
              className="w-full h-full object-cover"
            />
            <div className="absolute top-3 left-3 bg-[#D4AF37] text-black text-sm font-bold px-3 py-1 rounded-full">
              {gift.karat}K
            </div>
            <div className="absolute inset-0 bg-gradient-to-t from-[#121212] to-transparent" />
          </div>

          {/* Gift Details */}
          <div className="p-4 space-y-4">
            {/* Sender */}
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-[#D4AF37]/20 flex items-center justify-center">
                <Gift size={20} className="text-[#D4AF37]" />
              </div>
              <div className="text-right flex-1">
                <p className="text-[#D4AF37] text-sm">وصلتك هدية من :</p>
                <p className="text-white font-bold font-['Cairo'] text-lg">{gift.sender_name}</p>
              </div>
            </div>

            {/* Type and Weight */}
            <div className="flex items-center justify-between">
              <div className="text-right">
                <p className="text-[#A1A1AA] text-sm">القيمة الحالية</p>
                <p className="text-[#D4AF37] font-bold text-2xl font-['Cairo']">{Number(currentValue).toLocaleString()} ر.ق</p>
              </div>
              <div className="text-left">
                <p className="text-[#A1A1AA] text-sm">نوع الذهب</p>
                <p className="text-white font-bold font-['Cairo']">{gift.type} عيار {gift.karat}</p>
                <p className="text-[#D4AF37] font-bold text-xl">{gift.weight_grams} جرام</p>
              </div>
            </div>

            {/* Certificate Button */}
            <button
              onClick={handleViewCertificate}
              className="w-full py-3 rounded-xl border border-[#27272A] flex items-center justify-center gap-2 text-[#A1A1AA] hover:border-[#D4AF37]/50 transition-colors"
              data-testid="view-certificate-btn"
            >
              <Award size={18} />
              عرض شهادة الملكية الرقمية
            </button>
          </div>
        </div>

        {/* Management Options */}
        <div className="space-y-3">
          <h3 className="text-white font-bold font-['Cairo'] flex items-center gap-2">
            <span className="w-1 h-5 bg-[#D4AF37] rounded-full" />
            خيارات الإدارة
          </h3>

          {/* Sell Option */}
          <button
            onClick={handleSellGift}
            className="w-full bg-[#D4AF37] hover:bg-[#F4C430] text-black font-bold py-4 rounded-xl flex items-center justify-between px-4 gold-glow transition-all"
            data-testid="sell-gift-btn"
          >
            <ChevronLeft size={20} />
            <div className="flex items-center gap-3">
              <span>بيع وتحويل نقدي</span>
              <Banknote size={24} />
            </div>
          </button>

          {/* Regift Option */}
          <button
            onClick={handleRegift}
            className="w-full bg-[#121212] border border-[#27272A] hover:border-[#D4AF37]/50 text-white font-bold py-4 rounded-xl flex items-center justify-between px-4 transition-all"
            data-testid="regift-btn"
          >
            <ChevronLeft size={20} className="text-[#A1A1AA]" />
            <div className="flex items-center gap-3">
              <span>إعادة إهداء</span>
              <Send size={24} className="text-[#D4AF37]" />
            </div>
          </button>

          {/* Add to Portfolio Option */}
          <button
            onClick={handleAddToPortfolio}
            className="w-full bg-[#121212] border border-[#27272A] hover:border-[#D4AF37]/50 text-white font-bold py-4 rounded-xl flex items-center justify-between px-4 transition-all"
            data-testid="add-portfolio-btn"
          >
            <ChevronLeft size={20} className="text-[#A1A1AA]" />
            <div className="flex items-center gap-3">
              <span>إضافة لمحفظة الاستثمار</span>
              <Wallet size={24} className="text-[#D4AF37]" />
            </div>
          </button>
        </div>

        {/* Security Note */}
        <div className="text-center py-4 space-y-1">
          <p className="text-[#A1A1AA] text-sm flex items-center justify-center gap-2">
            <Shield size={14} />
            جميع المعاملات مؤمنة ومشفرة بالكامل
          </p>
          <p className="text-[#666] text-xs">
            تخضع عملية البيع لأسعار السوق العالمية المحدثة وقت التنفيذ
          </p>
        </div>
      </div>

      <BottomNav />
    </div>
  );
};

export default ReceivedGiftPage;
