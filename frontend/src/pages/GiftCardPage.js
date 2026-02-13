import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import axios from "axios";
import { Gift, Share2, Copy, Check, Sparkles } from "lucide-react";
import { Button } from "../components/ui/button";
import { toast } from "sonner";
import { API } from "../context/AuthContext";

const occasionLabels = {
  birthday: "🎂 عيد ميلاد",
  wedding: "💍 زواج",
  graduation: "🎓 تخرج",
  eid: "🌙 عيد",
  newborn: "👶 مولود جديد",
  anniversary: "❤️ ذكرى زواج",
  promotion: "🎉 ترقية",
  thank_you: "🙏 شكر وتقدير",
  other: "✨ مناسبة خاصة"
};

const GiftCardPage = () => {
  const { voucherCode } = useParams();
  const [voucher, setVoucher] = useState(null);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    const fetchVoucher = async () => {
      try {
        const res = await axios.get(`${API}/gifts/voucher/${voucherCode}`);
        setVoucher(res.data);
      } catch (error) {
        console.error("Error fetching voucher:", error);
      }
      setLoading(false);
    };
    fetchVoucher();
  }, [voucherCode]);

  const copyCode = () => {
    navigator.clipboard.writeText(voucherCode);
    setCopied(true);
    toast.success("تم نسخ الكود!");
    setTimeout(() => setCopied(false), 2000);
  };

  const shareViaWhatsApp = () => {
    const message = `🎁 لديك هدية من ${voucher.sender_name}!\n\n` +
      `💰 قيمة الهدية: ${voucher.amount_qar} ريال قطري\n` +
      `🎯 المناسبة: ${occasionLabels[voucher.occasion] || "هدية خاصة"}\n` +
      `📝 الرسالة: ${voucher.message || "بدون رسالة"}\n\n` +
      `🔗 شاهد بطاقة الهدية:\n${window.location.href}\n\n` +
      `🔑 كود القسيمة: ${voucherCode}`;
    
    const whatsappUrl = `https://wa.me/?text=${encodeURIComponent(message)}`;
    window.open(whatsappUrl, '_blank');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0A0A0A] flex items-center justify-center">
        <div className="animate-spin w-8 h-8 border-2 border-[#D4AF37] border-t-transparent rounded-full"></div>
      </div>
    );
  }

  if (!voucher) {
    return (
      <div className="min-h-screen bg-[#0A0A0A] flex items-center justify-center p-4">
        <div className="text-center">
          <Gift size={64} className="text-[#D4AF37] mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-white font-['Cairo'] mb-2">القسيمة غير موجودة</h1>
          <p className="text-[#A1A1AA]">تأكد من صحة الرابط أو الكود</p>
        </div>
      </div>
    );
  }

  const isRedeemed = voucher.status === "redeemed";
  const isExpired = voucher.status === "expired";

  return (
    <div className="min-h-screen bg-[#0A0A0A] flex items-center justify-center p-4" dir="rtl">
      {/* Background decorations */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-10 right-10 w-32 h-32 bg-[#D4AF37]/10 rounded-full blur-3xl"></div>
        <div className="absolute bottom-20 left-10 w-40 h-40 bg-[#D4AF37]/5 rounded-full blur-3xl"></div>
        <Sparkles className="absolute top-20 left-20 text-[#D4AF37]/20" size={24} />
        <Sparkles className="absolute bottom-40 right-20 text-[#D4AF37]/20" size={32} />
      </div>

      <div className="w-full max-w-md relative">
        {/* Gift Card */}
        <div className="bg-gradient-to-br from-[#1A1A1A] via-[#121212] to-[#0D0D0D] rounded-3xl border-2 border-[#D4AF37]/40 shadow-2xl overflow-hidden">
          {/* Header with Logo */}
          <div className="bg-gradient-to-r from-[#D4AF37]/20 to-[#D4AF37]/10 p-6 text-center border-b border-[#D4AF37]/30">
            <img src="/logo.png" alt="زينة وخزينة" className="h-20 w-20 mx-auto mb-3 object-contain" />
            <h1 className="text-2xl font-bold text-[#D4AF37] font-['Cairo']">قسيمة هدية</h1>
            <p className="text-[#A1A1AA] text-sm mt-1">زينة وخزينة للذهب</p>
          </div>

          {/* Gift Details */}
          <div className="p-6 space-y-4">
            {/* Occasion Badge */}
            {voucher.occasion && (
              <div className="text-center">
                <span className="inline-block bg-[#D4AF37]/20 text-[#D4AF37] px-4 py-2 rounded-full text-lg font-semibold">
                  {occasionLabels[voucher.occasion] || "🎁 هدية خاصة"}
                </span>
              </div>
            )}

            {/* From / To */}
            <div className="bg-[#0A0A0A] rounded-2xl p-4 space-y-3">
              <div className="flex justify-between items-center border-b border-[#27272A] pb-3">
                <span className="text-white font-semibold text-lg">{voucher.sender_name}</span>
                <span className="text-[#A1A1AA] text-sm">من:</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-white font-semibold text-lg">{voucher.recipient_name}</span>
                <span className="text-[#A1A1AA] text-sm">إلى:</span>
              </div>
            </div>

            {/* Value */}
            <div className="bg-gradient-to-r from-[#D4AF37]/20 to-[#D4AF37]/10 rounded-2xl p-5 text-center border border-[#D4AF37]/30">
              <p className="text-[#A1A1AA] text-sm mb-1">قيمة الهدية</p>
              <p className="text-4xl font-bold text-[#D4AF37] font-['Cairo']">{voucher.amount_qar.toLocaleString()}</p>
              <p className="text-[#D4AF37] text-lg">ريال قطري</p>
            </div>

            {/* Message */}
            {voucher.message && (
              <div className="bg-[#0A0A0A] rounded-2xl p-4">
                <p className="text-[#A1A1AA] text-sm mb-2">رسالة خاصة:</p>
                <p className="text-white text-lg leading-relaxed">"{voucher.message}"</p>
              </div>
            )}

            {/* Voucher Code */}
            <div className="bg-[#0A0A0A] rounded-2xl p-4">
              <p className="text-[#A1A1AA] text-sm mb-2 text-center">كود القسيمة</p>
              <div className="flex items-center justify-center gap-3">
                <button 
                  onClick={copyCode}
                  className="text-[#A1A1AA] hover:text-[#D4AF37] transition-colors"
                >
                  {copied ? <Check size={20} className="text-green-400" /> : <Copy size={20} />}
                </button>
                <span className="text-2xl font-mono font-bold text-[#D4AF37] tracking-wider">{voucherCode}</span>
              </div>
            </div>

            {/* Status Badge */}
            {(isRedeemed || isExpired) && (
              <div className={`text-center p-3 rounded-xl ${isRedeemed ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'}`}>
                {isRedeemed ? "✓ تم استخدام هذه القسيمة" : "⚠️ انتهت صلاحية القسيمة"}
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="p-6 pt-0 space-y-3">
            {/* Share Button */}
            <Button
              onClick={shareViaWhatsApp}
              className="w-full bg-[#25D366] hover:bg-[#128C7E] text-white font-bold rounded-xl h-12 flex items-center justify-center gap-2"
            >
              <Share2 size={20} />
              مشاركة عبر واتساب
            </Button>

            {/* Redeem Instructions */}
            {!isRedeemed && !isExpired && (
              <p className="text-[#666] text-xs text-center">
                يمكن استخدام هذه القسيمة للشراء من تطبيق زينة وخزينة
              </p>
            )}
          </div>
        </div>

        {/* Decorative ribbon */}
        <div className="absolute -top-2 left-1/2 transform -translate-x-1/2 w-16 h-8 bg-[#D4AF37] rounded-b-full shadow-lg flex items-center justify-center">
          <Gift size={16} className="text-black" />
        </div>
      </div>
    </div>
  );
};

export default GiftCardPage;
