import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { Gift, Send, MessageSquare, Clock, Shield, Smartphone, GraduationCap, Heart, PartyPopper, Star, Check, Scale } from "lucide-react";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Textarea } from "../components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../components/ui/select";
import { toast } from "sonner";
import { useAuth, apiCall, API } from "../context/AuthContext";
import { BottomNav, TopHeader } from "../components/Navigation";

const GiftsPage = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  
  const [formData, setFormData] = useState({
    recipientName: "",
    whatsappNumber: "",
    amount: "",
    occasion: "",
    message: ""
  });
  const [loading, setLoading] = useState(false);
  const [sentVoucher, setSentVoucher] = useState(null);
  const [goldPrices, setGoldPrices] = useState([]);

  // Fetch gold prices
  useEffect(() => {
    const fetchPrices = async () => {
      try {
        const res = await axios.get(`${API}/gold-prices`);
        setGoldPrices(res.data);
      } catch (error) {
        console.error("Error fetching gold prices:", error);
      }
    };
    fetchPrices();
  }, []);

  // Calculate gold equivalent
  const getGoldEquivalent = (amount) => {
    if (!amount || !goldPrices.length) return null;
    const price24k = goldPrices.find(p => p.karat === 24)?.price_per_gram_qar;
    const price21k = goldPrices.find(p => p.karat === 21)?.price_per_gram_qar;
    const price18k = goldPrices.find(p => p.karat === 18)?.price_per_gram_qar;
    if (!price24k || !price21k || !price18k) return null;
    return {
      grams24k: (parseFloat(amount) / price24k).toFixed(2),
      grams21k: (parseFloat(amount) / price21k).toFixed(2),
      grams18k: (parseFloat(amount) / price18k).toFixed(2),
      price24k: price24k.toFixed(2),
      price21k: price21k.toFixed(2),
      price18k: price18k.toFixed(2)
    };
  };

  const goldEquivalent = getGoldEquivalent(formData.amount);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!user) {
      toast.error("يرجى تسجيل الدخول أولاً");
      navigate("/auth");
      return;
    }

    if (!formData.recipientName || !formData.whatsappNumber || !formData.amount) {
      toast.error("يرجى ملء جميع الحقول المطلوبة");
      return;
    }

    setLoading(true);
    try {
      // Create gift voucher
      const response = await apiCall("post", "/gifts/voucher", {
        recipient_name: formData.recipientName,
        whatsapp_number: formData.whatsappNumber,
        amount_qar: parseFloat(formData.amount),
        occasion: formData.occasion,
        message: formData.message,
        validity_days: 365 // صالحة لمدة سنة تلقائياً
      });
      
      // Save voucher with additional info for display
      setSentVoucher({
        ...response.voucher,
        occasion: formData.occasion,
        message: formData.message,
        whatsapp_number: formData.whatsappNumber
      });
      
      toast.success("تم إنشاء القسيمة بنجاح!");
      
      // Clear form
      setFormData({
        recipientName: "",
        whatsappNumber: "",
        amount: "",
        occasion: "",
        message: ""
      });
      
      // Scroll to show the success message
      setTimeout(() => {
        document.getElementById('voucher-success')?.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }, 100);
      
    } catch (error) {
      toast.error("فشل في إرسال القسيمة");
      console.error(error);
    }
    setLoading(false);
  };

  const features = [
    { icon: Smartphone, text: "إرسال فوري عبر واتساب" },
    { icon: MessageSquare, text: "رسالة شخصية مخصصة" },
    { icon: Gift, text: "قابلة للاستخدام في جميع المنتجات" },
    { icon: Shield, text: "آمنة وسهلة الاستخدام" },
    { icon: Check, text: "متوافقة مع الشريعة" },
  ];

  const occasions = [
    { icon: PartyPopper, text: "أعياد الميلاد", color: "text-pink-400" },
    { icon: Heart, text: "حفلات الزفاف", color: "text-red-400" },
    { icon: GraduationCap, text: "التخرج والنجاح", color: "text-blue-400" },
    { icon: Star, text: "المناسبات الخاصة", color: "text-yellow-400" },
  ];

  return (
    <div className="min-h-screen bg-[#050505] pb-20" data-testid="gifts-page">
      <TopHeader title="الهدايا" />

      {/* Hero Section */}
      <div className="px-4 py-6 text-center">
        <h1 className="text-2xl font-bold text-[#D4AF37] font-['Cairo'] mb-2">
          أرسل قسيمة ذهب رقمية
        </h1>
        <p className="text-[#A1A1AA] text-sm">
          أرسل قسيمة ذهب رقمية عبر واتساب لأحبائك وعائلتك
        </p>
      </div>

      {/* Main Content */}
      <div className="px-4 grid grid-cols-1 lg:grid-cols-2 gap-4">
        
        {/* Gift Card Image */}
        <div className="bg-[#121212] border border-[#27272A] rounded-2xl p-6 flex items-center justify-center min-h-[300px]">
          <div className="relative">
            <div className="w-72 h-48 bg-gradient-to-br from-[#1A1A1A] to-[#0A0A0A] rounded-2xl border-2 border-[#D4AF37]/40 shadow-2xl transform rotate-[-3deg] flex flex-col items-center justify-center p-4">
              <img src="/logo.png" alt="زينة وخزينة" className="h-32 w-auto max-w-full object-contain mb-2" />
              <p className="text-[#D4AF37] text-lg font-bold font-['Cairo']">قسيمة هدية</p>
              <p className="text-[#A1A1AA] text-sm mt-1">زينة وخزينة</p>
            </div>
            {/* Decorative elements */}
            <div className="absolute -top-3 -right-3 w-10 h-10 bg-[#D4AF37] rounded-full flex items-center justify-center shadow-lg">
              <Gift size={20} className="text-black" />
            </div>
          </div>
        </div>

        {/* Send Voucher Form */}
        <div className="bg-[#121212] border border-[#27272A] rounded-2xl p-5">
          <div className="flex items-center gap-3 mb-5">
            <div className="w-10 h-10 bg-[#D4AF37]/20 rounded-full flex items-center justify-center">
              <Gift size={20} className="text-[#D4AF37]" />
            </div>
            <h2 className="text-xl font-bold text-[#D4AF37] font-['Cairo']">إرسال قسيمة</h2>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Recipient Name */}
            <div>
              <label className="text-white text-sm mb-2 block text-right">اسم المُهدى إليه</label>
              <Input
                name="recipientName"
                value={formData.recipientName}
                onChange={handleInputChange}
                placeholder="محمد أحمد"
                className="bg-[#0A0A0A] border-[#27272A] text-white h-12 rounded-xl text-right"
                data-testid="recipient-name-input"
              />
            </div>

            {/* WhatsApp Number */}
            <div>
              <label className="text-white text-sm mb-2 block text-right">رقم الواتساب</label>
              <Input
                name="whatsappNumber"
                value={formData.whatsappNumber}
                onChange={handleInputChange}
                placeholder="+97400000000"
                className="bg-[#0A0A0A] border-[#27272A] text-white h-12 rounded-xl text-right"
                dir="ltr"
                data-testid="whatsapp-input"
              />
              <p className="text-[#666] text-xs mt-1 text-right">يجب أن يبدأ بـ + ومفتاح الدولة</p>
            </div>

            {/* Amount */}
            <div>
              <label className="text-white text-sm mb-2 block text-right">قيمة القسيمة (ريال قطري)</label>
              <Input
                name="amount"
                type="number"
                value={formData.amount}
                onChange={handleInputChange}
                placeholder="100.00"
                min="50"
                className="bg-[#0A0A0A] border-[#27272A] text-white h-12 rounded-xl text-right"
                data-testid="amount-input"
              />
              
              {/* Gold Equivalent Display */}
              {goldEquivalent && formData.amount >= 50 && (
                <div className="mt-3 bg-[#D4AF37]/10 border border-[#D4AF37]/30 rounded-xl p-3" dir="rtl">
                  <div className="flex items-center gap-2 mb-2">
                    <Scale size={16} className="text-[#D4AF37]" />
                    <span className="text-[#D4AF37] text-sm font-semibold">ما يعادله من الذهب</span>
                  </div>
                  <div className="grid grid-cols-3 gap-2 text-center">
                    <div className="bg-[#0A0A0A] rounded-lg p-2">
                      <p className="text-[#D4AF37] font-bold text-base">{goldEquivalent.grams24k} جرام</p>
                      <p className="text-[#A1A1AA] text-xs">عيار 24</p>
                      <p className="text-[#666] text-[10px]">({goldEquivalent.price24k} ر.ق)</p>
                    </div>
                    <div className="bg-[#0A0A0A] rounded-lg p-2">
                      <p className="text-[#D4AF37] font-bold text-base">{goldEquivalent.grams21k} جرام</p>
                      <p className="text-[#A1A1AA] text-xs">عيار 21</p>
                      <p className="text-[#666] text-[10px]">({goldEquivalent.price21k} ر.ق)</p>
                    </div>
                    <div className="bg-[#0A0A0A] rounded-lg p-2">
                      <p className="text-[#D4AF37] font-bold text-base">{goldEquivalent.grams18k} جرام</p>
                      <p className="text-[#A1A1AA] text-xs">عيار 18</p>
                      <p className="text-[#666] text-[10px]">({goldEquivalent.price18k} ر.ق)</p>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Occasion */}
            <div>
              <label className="text-white text-sm mb-2 block text-right">المناسبة</label>
              <Select value={formData.occasion} onValueChange={(value) => setFormData(prev => ({ ...prev, occasion: value }))}>
                <SelectTrigger className="bg-[#0A0A0A] border-[#27272A] text-white h-12 rounded-xl">
                  <SelectValue placeholder="اختر المناسبة" />
                </SelectTrigger>
                <SelectContent className="bg-[#1A1A1A] border-[#27272A]">
                  <SelectItem value="birthday">🎂 عيد ميلاد</SelectItem>
                  <SelectItem value="wedding">💍 زواج</SelectItem>
                  <SelectItem value="graduation">🎓 تخرج</SelectItem>
                  <SelectItem value="eid">🌙 عيد</SelectItem>
                  <SelectItem value="newborn">👶 مولود جديد</SelectItem>
                  <SelectItem value="anniversary">❤️ ذكرى زواج</SelectItem>
                  <SelectItem value="promotion">🎉 ترقية</SelectItem>
                  <SelectItem value="thank_you">🙏 شكر وتقدير</SelectItem>
                  <SelectItem value="other">✨ مناسبة أخرى</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Personal Message */}
            <div>
              <label className="text-white text-sm mb-2 block text-right">رسالة شخصية</label>
              <Textarea
                name="message"
                value={formData.message}
                onChange={handleInputChange}
                placeholder="اكتب رسالتك الشخصية..."
                className="bg-[#0A0A0A] border-[#27272A] text-white rounded-xl text-right min-h-[100px] resize-none"
                data-testid="message-input"
              />
            </div>

            {/* Submit Button */}
            <Button
              type="submit"
              disabled={loading}
              className="w-full bg-[#D4AF37] hover:bg-[#F4C430] text-black font-bold rounded-xl h-12 flex items-center justify-center gap-2"
              data-testid="send-voucher-btn"
            >
              <Send size={18} />
              {loading ? "جاري الإرسال..." : "إرسال القسيمة"}
            </Button>

            {/* Note */}
            <div className="bg-[#D4AF37]/10 border border-[#D4AF37]/30 rounded-xl p-3 flex items-center gap-2">
              <Smartphone size={18} className="text-[#D4AF37] flex-shrink-0" />
              <p className="text-[#D4AF37] text-xs text-right">
                سيتم إنشاء بطاقة هدية جميلة يمكنك مشاركتها عبر واتساب
              </p>
            </div>
          </form>

          {/* Success Message - Show after voucher is sent */}
          {sentVoucher && (
            <div className="mt-6 bg-gradient-to-br from-green-900/30 to-[#0A0A0A] border border-green-500/50 rounded-xl p-5" data-testid="voucher-success">
              <div className="flex items-center gap-3 mb-4">
                <Check size={24} className="text-green-400" />
                <h3 className="text-lg font-bold text-green-400 font-['Cairo']">تم إنشاء القسيمة بنجاح!</h3>
              </div>
              
              {/* Gift Card Preview */}
              <div className="bg-[#0A0A0A] rounded-xl p-4 mb-4 border border-[#27272A]">
                <div className="flex items-center gap-3 mb-3">
                  <img src="/logo.png" alt="زينة وخزينة" className="h-12 w-12 object-contain" />
                  <div>
                    <p className="text-[#D4AF37] font-bold">قسيمة هدية</p>
                    <p className="text-[#A1A1AA] text-xs">زينة وخزينة للذهب</p>
                  </div>
                </div>
                <div className="space-y-2 text-right text-sm">
                  <div className="flex justify-between">
                    <span className="text-white">{sentVoucher.recipient_name}</span>
                    <span className="text-[#A1A1AA]">إلى:</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-[#D4AF37] font-bold text-lg">{sentVoucher.amount_qar} ر.ق</span>
                    <span className="text-[#A1A1AA]">القيمة:</span>
                  </div>
                  <div className="flex justify-between items-center pt-2 border-t border-[#27272A]">
                    <span className="text-green-400 font-mono">{sentVoucher.voucher_code}</span>
                    <span className="text-[#A1A1AA]">الكود:</span>
                  </div>
                </div>
              </div>

              {/* Share Buttons */}
              <div className="space-y-2">
                <Button
                  onClick={() => {
                    const cardUrl = `${window.location.origin}/gift-card/${sentVoucher.voucher_code}`;
                    const message = `🎁 لديك هدية!\n💰 القيمة: ${sentVoucher.amount_qar} ر.ق\n🔗 شاهد بطاقة الهدية:\n${cardUrl}`;
                    window.open(`https://wa.me/?text=${encodeURIComponent(message)}`, '_blank');
                  }}
                  className="w-full bg-[#25D366] hover:bg-[#128C7E] text-white font-bold rounded-xl h-12 flex items-center justify-center gap-2"
                >
                  <Smartphone size={20} />
                  إرسال البطاقة عبر واتساب
                </Button>
                
                <Button
                  onClick={() => window.open(`/gift-card/${sentVoucher.voucher_code}`, '_blank')}
                  className="w-full bg-[#D4AF37]/20 hover:bg-[#D4AF37]/30 text-[#D4AF37] font-bold rounded-xl h-10 flex items-center justify-center gap-2"
                >
                  <Gift size={18} />
                  معاينة البطاقة
                </Button>
              </div>

              <button 
                onClick={() => setSentVoucher(null)}
                className="w-full mt-4 text-[#A1A1AA] hover:text-white text-sm py-2 transition-colors"
              >
                إرسال قسيمة أخرى
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Features Section */}
      <div className="px-4 mt-6" dir="rtl">
        <div className="bg-[#121212] border border-[#27272A] rounded-2xl p-5">
          <h3 className="text-lg font-bold text-[#D4AF37] font-['Cairo'] mb-4 text-right">مميزات القسائم الرقمية</h3>
          <div className="space-y-3">
            {features.map((feature, index) => (
              <div key={index} className="flex items-center gap-3">
                <div className="w-2 h-2 bg-[#D4AF37] rounded-full flex-shrink-0" />
                <span className="text-[#A1A1AA] text-sm">{feature.text}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Occasions Section */}
      <div className="px-4 mt-4 mb-4" dir="rtl">
        <div className="bg-[#121212] border border-[#27272A] rounded-2xl p-5">
          <h3 className="text-lg font-bold text-[#D4AF37] font-['Cairo'] mb-4 text-right">مناسبات مثالية</h3>
          <div className="grid grid-cols-2 gap-3">
            {occasions.map((occasion, index) => (
              <div key={index} className="flex items-center gap-2">
                <occasion.icon size={18} className={occasion.color} />
                <span className="text-[#A1A1AA] text-sm">{occasion.text}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <BottomNav />
    </div>
  );
};

export default GiftsPage;
