import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Gift, Send, MessageSquare, Clock, Shield, Smartphone, GraduationCap, Heart, PartyPopper, Star, Check } from "lucide-react";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Textarea } from "../components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../components/ui/select";
import { toast } from "sonner";
import { useAuth, apiCall } from "../context/AuthContext";
import { BottomNav, TopHeader } from "../components/Navigation";

const GiftsPage = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  
  const [formData, setFormData] = useState({
    recipientName: "",
    whatsappNumber: "",
    amount: "",
    message: "",
    validityDays: "30"
  });
  const [loading, setLoading] = useState(false);
  const [sentVoucher, setSentVoucher] = useState(null);

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
      await apiCall("post", "/gifts/voucher", {
        recipient_name: formData.recipientName,
        whatsapp_number: formData.whatsappNumber,
        amount_qar: parseFloat(formData.amount),
        message: formData.message,
        validity_days: parseInt(formData.validityDays)
      });
      
      toast.success("تم إرسال القسيمة بنجاح!");
      setFormData({
        recipientName: "",
        whatsappNumber: "",
        amount: "",
        message: "",
        validityDays: "30"
      });
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
        <div className="bg-[#121212] border border-[#27272A] rounded-2xl p-6 flex items-center justify-center">
          <div className="relative">
            <div className="w-64 h-40 bg-gradient-to-br from-[#1A1A1A] to-[#0A0A0A] rounded-xl border border-[#D4AF37]/30 shadow-2xl transform rotate-[-5deg] flex items-center justify-center">
              <div className="text-center">
                <img src="/logo.png" alt="زينة وخزينة" className="h-16 w-16 mx-auto mb-2 object-contain opacity-80" />
                <p className="text-[#D4AF37] text-xs font-['Cairo']">قسيمة هدية</p>
              </div>
            </div>
            {/* Decorative elements */}
            <div className="absolute -top-2 -right-2 w-8 h-8 bg-[#D4AF37] rounded-full flex items-center justify-center">
              <Gift size={16} className="text-black" />
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

            {/* Validity */}
            <div>
              <label className="text-white text-sm mb-2 block text-right">صالحة لمدة (أيام)</label>
              <Select value={formData.validityDays} onValueChange={(value) => setFormData(prev => ({ ...prev, validityDays: value }))}>
                <SelectTrigger className="bg-[#0A0A0A] border-[#27272A] text-white h-12 rounded-xl">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-[#1A1A1A] border-[#27272A]">
                  <SelectItem value="7">7 أيام</SelectItem>
                  <SelectItem value="14">14 يوم</SelectItem>
                  <SelectItem value="30">30 يوم</SelectItem>
                  <SelectItem value="60">60 يوم</SelectItem>
                  <SelectItem value="90">90 يوم</SelectItem>
                </SelectContent>
              </Select>
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
                سيتم إرسال القسيمة مباشرة عبر واتساب للمستلم مع رسالتك الشخصية
              </p>
            </div>
          </form>
        </div>
      </div>

      {/* Features Section */}
      <div className="px-4 mt-6">
        <div className="bg-[#121212] border border-[#27272A] rounded-2xl p-5">
          <h3 className="text-lg font-bold text-[#D4AF37] font-['Cairo'] mb-4 text-right">مميزات القسائم الرقمية</h3>
          <div className="space-y-3">
            {features.map((feature, index) => (
              <div key={index} className="flex items-center gap-3 justify-end">
                <span className="text-[#A1A1AA] text-sm">{feature.text}</span>
                <div className="w-2 h-2 bg-[#D4AF37] rounded-full" />
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Occasions Section */}
      <div className="px-4 mt-4 mb-4">
        <div className="bg-[#121212] border border-[#27272A] rounded-2xl p-5">
          <h3 className="text-lg font-bold text-[#D4AF37] font-['Cairo'] mb-4 text-right">مناسبات مثالية</h3>
          <div className="grid grid-cols-2 gap-3">
            {occasions.map((occasion, index) => (
              <div key={index} className="flex items-center gap-2 justify-end">
                <span className="text-[#A1A1AA] text-sm">{occasion.text}</span>
                <occasion.icon size={18} className={occasion.color} />
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
