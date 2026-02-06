import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Gift, TrendingUp, RefreshCw, Wallet, ArrowLeft, Loader2 } from "lucide-react";
import { Button } from "../components/ui/button";
import { toast } from "sonner";
import { apiCall } from "../context/AuthContext";

const ReceiveGiftPage = () => {
  const { token } = useParams();
  const navigate = useNavigate();
  const [gift, setGift] = useState(null);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);

  useEffect(() => {
    fetchGift();
  }, [token]);

  const fetchGift = async () => {
    try {
      const response = await apiCall("get", `/gifts/${token}`);
      setGift(response.data);
      
      // Commented out for testing - allow viewing redeemed gifts
      // if (response.data.status === "redeemed") {
      //   toast.info("تم استلام هذه الهدية مسبقاً");
      // }
    } catch (error) {
      toast.error("رابط الهدية غير صحيح أو منتهي الصلاحية");
      setTimeout(() => navigate("/"), 2000);
    }
    setLoading(false);
  };

  const handleRedeem = async (action) => {
    // Remove this check for testing - allow multiple redeems in development
    // if (!gift || gift.status === "redeemed") {
    //   toast.error("هذه الهدية غير متاحة");
    //   return;
    // }

    setProcessing(true);
    try {
      await apiCall("put", `/gifts/${token}/redeem`, {
        action: action, // "sell", "regift", "save"
      });

      let message = "";
      switch (action) {
        case "sell":
          message = "تم بيع الهدية وتحويل المبلغ إلى حسابك!";
          break;
        case "regift":
          message = "يمكنك الآن إعادة إهداء هذه الهدية لشخص آخر";
          navigate(`/send-gift/${gift.product.product_id}`);
          return;
        case "save":
          message = "تم إضافة الهدية إلى محفظة الاستثمار الخاصة بك!";
          break;
      }

      toast.success(message);
      fetchGift(); // Refresh gift status
    } catch (error) {
      toast.error(error.response?.data?.detail || "فشل في معالجة الهدية");
    }
    setProcessing(false);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-[#0A0A0A] to-[#050505] flex items-center justify-center">
        <Loader2 className="text-[#D4AF37] animate-spin" size={48} />
      </div>
    );
  }

  if (!gift) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-[#0A0A0A] to-[#050505] flex items-center justify-center p-4">
        <div className="text-center">
          <Gift className="text-[#D4AF37] mx-auto mb-4" size={64} />
          <h2 className="text-white text-2xl font-bold mb-2">هدية غير موجودة</h2>
          <p className="text-[#A1A1AA]">الرابط غير صحيح أو انتهت صلاحيته</p>
        </div>
      </div>
    );
  }

  const product = gift.product;
  const isRedeemed = gift.status === "redeemed";

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#0A0A0A] to-[#050505]">
      {/* Header */}
      <div className="bg-[#0A0A0A]/80 backdrop-blur-sm border-b border-[#27272A] p-4 flex items-center justify-between sticky top-0 z-10">
        <button 
          onClick={() => navigate("/")}
          className="p-2 rounded-full hover:bg-[#1A1A1A] transition-colors"
        >
          <ArrowLeft className="text-white" size={24} />
        </button>
        <h1 className="text-white font-bold text-lg font-['Cairo']">إدارة الهدية المستلمة</h1>
        <div className="w-10" /> {/* Spacer */}
      </div>

      <div className="p-4 space-y-4 pb-8">
        {/* Gift Announcement */}
        <div className="text-center py-6">
          <div className="inline-block bg-[#D4AF37]/10 border border-[#D4AF37]/30 rounded-full px-6 py-3 mb-3">
            <p className="text-[#D4AF37] font-bold text-lg">
              وصلتك هدية من: {gift.sender_name || "صديق مجهول"}
            </p>
          </div>
          {gift.personal_message && (
            <div className="bg-[#1A1A1A] border border-[#27272A] rounded-xl p-4 max-w-md mx-auto">
              <p className="text-white text-center italic">
                "{gift.personal_message}"
              </p>
            </div>
          )}
        </div>

        {/* Gold Price Ticker */}
        <div className="bg-gradient-to-r from-[#1A1A1A] via-[#27272A] to-[#1A1A1A] border border-[#D4AF37]/30 rounded-2xl p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <TrendingUp className="text-[#D4AF37]" size={20} />
              <span className="text-[#A1A1AA] text-sm">سعر الذهب الآن (عيار 24)</span>
            </div>
            <div className="text-left">
              <p className="text-[#D4AF37] font-bold text-2xl">
                {product.price_qar?.toLocaleString()} ر.ق / 1 جرام
              </p>
              <p className="text-green-400 text-xs flex items-center justify-end gap-1 mt-1">
                <TrendingUp size={12} />
                تحديث آني
              </p>
            </div>
          </div>
        </div>

        {/* Product Card */}
        <div className="bg-gradient-to-br from-[#1A1A1A] to-[#0A0A0A] border-2 border-[#D4AF37]/50 rounded-3xl overflow-hidden shadow-2xl">
          {/* Product Image */}
          <div className="relative aspect-[4/3] overflow-hidden">
            <img 
              src={product.image_url} 
              alt={product.title}
              className="w-full h-full object-cover"
            />
            <div className="absolute top-4 left-4">
              <span className="bg-[#D4AF37] text-black font-bold px-4 py-2 rounded-full text-sm">
                24K
              </span>
            </div>
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />
          </div>

          {/* Product Details */}
          <div className="p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-[#27272A] pb-4">
              <div className="text-left">
                <Gift className="text-[#D4AF37] mb-2" size={32} />
              </div>
              <div className="text-right">
                <p className="text-[#A1A1AA] text-sm mb-1">وصلتك هدية من:</p>
                <h2 className="text-white text-2xl font-bold font-['Cairo']">
                  {gift.sender_name || "مجهول"}
                </h2>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="bg-[#0A0A0A] border border-[#27272A] rounded-xl p-4 text-center">
                <p className="text-[#A1A1AA] text-xs mb-1">نوع الذهب</p>
                <p className="text-white font-bold">{product.category || "سبيكة ذهب عيار 24"}</p>
              </div>
              <div className="bg-[#0A0A0A] border border-[#27272A] rounded-xl p-4 text-center">
                <p className="text-[#A1A1AA] text-xs mb-1">الوزن</p>
                <p className="text-[#D4AF37] font-bold text-xl">{product.weight_grams || "10"} جرام</p>
              </div>
            </div>

            <div className="bg-[#0A0A0A] border border-[#D4AF37]/30 rounded-xl p-4">
              <div className="flex items-center justify-between">
                <span className="text-[#A1A1AA] text-sm">القيمة الحالية</span>
                <span className="text-[#D4AF37] font-bold text-3xl">
                  {product.price_qar?.toLocaleString()} ر.ق
                </span>
              </div>
            </div>

            {/* Certificate Button */}
            <Button
              onClick={() => {
                toast.success("جاري تحميل شهادة الملكية الرقمية...");
                // TODO: Generate and download PDF certificate
                setTimeout(() => {
                  toast.info("سيتم إضافة ميزة تحميل الشهادة قريباً!");
                }, 1000);
              }}
              variant="outline"
              className="w-full border-[#27272A] text-white hover:bg-[#1A1A1A] h-12 rounded-xl"
            >
              <svg className="ml-2" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                <polyline points="14 2 14 8 20 8" />
                <line x1="9" y1="15" x2="15" y2="15" />
                <line x1="9" y1="11" x2="13" y2="11" />
              </svg>
              عرض شهادة الملكية الرقمية
            </Button>
          </div>
        </div>

        {/* Action Options */}
        {!isRedeemed ? (
          <div className="space-y-3">
            <h3 className="text-white font-bold text-lg text-center mb-4 font-['Cairo']">
              خيارات استلام الهدية
            </h3>

            {/* Sell & Convert */}
            <Button
              onClick={() => handleRedeem("sell")}
              disabled={processing}
              className="w-full bg-gradient-to-r from-[#D4AF37] to-[#F4C430] hover:from-[#F4C430] hover:to-[#D4AF37] text-black font-bold rounded-2xl h-16 text-lg"
            >
              <TrendingUp className="ml-2" size={24} />
              بيع وتحويل نقدي
              <ArrowLeft className="mr-2" size={20} />
            </Button>

            {/* Regift */}
            <Button
              onClick={() => handleRedeem("regift")}
              disabled={processing}
              variant="outline"
              className="w-full border-2 border-[#27272A] bg-[#0A0A0A] text-white hover:bg-[#1A1A1A] hover:border-[#D4AF37]/50 rounded-2xl h-16 text-lg"
            >
              <RefreshCw className="ml-2" size={24} />
              إعادة إهداء
              <ArrowLeft className="mr-2" size={20} />
            </Button>

            {/* Save to Wallet */}
            <Button
              onClick={() => handleRedeem("save")}
              disabled={processing}
              variant="outline"
              className="w-full border-2 border-[#27272A] bg-[#0A0A0A] text-white hover:bg-[#1A1A1A] hover:border-[#D4AF37]/50 rounded-2xl h-16 text-lg"
            >
              <Wallet className="ml-2" size={24} />
              إضافة لمحفظة الاستثمار
              <ArrowLeft className="mr-2" size={20} />
            </Button>
          </div>
        ) : null}
        {/* Removed the "already redeemed" message for testing */}

        {/* Security Footer */}
        <div className="bg-[#1A1A1A] border border-[#27272A] rounded-xl p-4 mt-6">
          <div className="flex items-center justify-center gap-2 text-[#A1A1AA] text-xs text-center">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor">
              <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
              <path d="M7 11V7a5 5 0 0 1 10 0v4" />
            </svg>
            <p>جميع المعاملات موثقة ومشفرة بأعلى معايير التشفير</p>
          </div>
          <p className="text-[#A1A1AA] text-xs text-center mt-2">
            تختص عملية البيع لأسعار السوق العالمية المحدثة وقت التنفيذ
          </p>
        </div>
      </div>
    </div>
  );
};

export default ReceiveGiftPage;
