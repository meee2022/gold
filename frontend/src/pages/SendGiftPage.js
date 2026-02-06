import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { ArrowRight, Gift, User, Phone, MessageSquare, Send } from "lucide-react";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { toast } from "sonner";
import { useAuth, apiCall } from "../context/AuthContext";
import { BottomNav, TopHeader } from "../components/Navigation";

const SendGiftPage = () => {
  const { productId } = useParams();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const navigate = useNavigate();
  const { user } = useAuth();

  const [formData, setFormData] = useState({
    senderName: user?.name || "",
    recipientName: "",
    recipientPhone: "",
    personalMessage: "",
  });

  useEffect(() => {
    fetchProduct();
  }, [productId]);

  const fetchProduct = async () => {
    try {
      const response = await apiCall("get", `/products/${productId}`);
      setProduct(response.data);
    } catch (error) {
      toast.error("فشل في تحميل بيانات المنتج");
      navigate("/gifts");
    }
    setLoading(false);
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSendGift = async () => {
    if (!formData.recipientName || !formData.recipientPhone) {
      toast.error("يرجى إدخال اسم ورقم هاتف المستلم");
      return;
    }

    if (!user) {
      toast.error("يرجى تسجيل الدخول أولاً");
      navigate("/auth");
      return;
    }

    setSending(true);
    try {
      const response = await apiCall("post", "/gifts/send", {
        product_id: productId,
        sender_id: user.user_id,
        sender_name: formData.senderName,
        recipient_name: formData.recipientName,
        recipient_phone: formData.recipientPhone,
        personal_message: formData.personalMessage,
      });

      toast.success("تم إرسال الهدية بنجاح! سيصل إشعار للمستلم قريباً");
      
      // Show gift link to user
      const giftToken = response.data.gift_token;
      const giftLink = `${window.location.origin}/receive-gift/${giftToken}`;
      
      // Copy to clipboard
      navigator.clipboard.writeText(giftLink);
      
      // Open WhatsApp with pre-filled message
      const whatsappMessage = encodeURIComponent(
        `🎁 *وصلتك هدية من ${formData.senderName || "صديقك"}!*\n\n` +
        `${formData.personalMessage ? `"${formData.personalMessage}"\n\n` : ""}` +
        `افتح الرابط التالي لاستلام هديتك:\n${giftLink}\n\n` +
        `✨ يمكنك اختيار بيع الهدية، إعادة إهدائها، أو إضافتها لمحفظة الاستثمار`
      );
      
      const whatsappUrl = `https://wa.me/${formData.recipientPhone.replace(/[^0-9]/g, '')}?text=${whatsappMessage}`;
      
      // Show confirmation dialog
      const sendNow = window.confirm(
        "هل تريد إرسال الهدية الآن عبر WhatsApp؟\n\n" +
        "سيتم فتح WhatsApp مع الرسالة جاهزة للإرسال"
      );
      
      if (sendNow) {
        window.open(whatsappUrl, '_blank');
        toast.success("تم فتح WhatsApp! أرسل الرسالة للمستلم");
      } else {
        // Show the link in a modal or alert for manual sharing
        alert(
          "رابط الهدية (تم النسخ):\n\n" + giftLink + "\n\n" +
          "يمكنك إرساله للمستلم عبر أي وسيلة تفضلها"
        );
        toast.info("تم نسخ رابط الهدية! يمكنك إرساله للمستلم لاحقاً");
      }
      
      navigate("/gifts");
    } catch (error) {
      toast.error(error.response?.data?.detail || "فشل في إرسال الهدية");
    }
    setSending(false);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#050505] pb-20">
        <TopHeader title="إرسال هدية" showBack />
        <div className="p-4">
          <div className="skeleton h-48 rounded-xl mb-4" />
          <div className="skeleton h-12 rounded-xl mb-3" />
          <div className="skeleton h-12 rounded-xl mb-3" />
        </div>
        <BottomNav />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#050505] pb-20">
      <TopHeader title="إرسال هدية" showBack />

      <div className="p-4 space-y-4">
        {/* Product Preview */}
        <div className="bg-gradient-to-br from-[#D4AF37]/20 to-[#0A0A0A] border border-[#D4AF37]/30 rounded-2xl p-4">
          <div className="flex items-center gap-4">
            <div className="w-24 h-24 rounded-xl overflow-hidden border-2 border-[#D4AF37]">
              <img 
                src={product?.image_url} 
                alt={product?.title}
                className="w-full h-full object-cover"
              />
            </div>
            <div className="flex-1">
              <h3 className="text-white font-bold text-lg mb-1">{product?.title}</h3>
              <p className="text-[#A1A1AA] text-sm mb-2">{product?.description}</p>
              <p className="text-[#D4AF37] font-bold text-xl">
                {product?.price_qar?.toLocaleString()} ر.ق
              </p>
            </div>
          </div>
        </div>

        {/* Sender Info */}
        <div className="space-y-3">
          <h3 className="text-white font-bold text-lg flex items-center gap-2">
            <Gift className="text-[#D4AF37]" size={20} />
            معلومات المُرسل
          </h3>
          <Input
            name="senderName"
            value={formData.senderName}
            onChange={handleChange}
            placeholder="اسمك (اختياري)"
            className="bg-[#1A1A1A] border-[#27272A] text-white text-right h-12"
          />
        </div>

        {/* Recipient Info */}
        <div className="space-y-3">
          <h3 className="text-white font-bold text-lg flex items-center gap-2">
            <User className="text-[#D4AF37]" size={20} />
            معلومات المستلم
          </h3>
          <Input
            name="recipientName"
            value={formData.recipientName}
            onChange={handleChange}
            placeholder="اسم المستلم *"
            required
            className="bg-[#1A1A1A] border-[#27272A] text-white text-right h-12"
          />
          <div className="relative">
            <Phone className="absolute left-3 top-1/2 -translate-y-1/2 text-[#A1A1AA]" size={18} />
            <Input
              name="recipientPhone"
              value={formData.recipientPhone}
              onChange={handleChange}
              placeholder="رقم هاتف المستلم (مثال: +97450123456) *"
              type="tel"
              required
              dir="ltr"
              className="bg-[#1A1A1A] border-[#27272A] text-white pl-12 h-12"
            />
          </div>
        </div>

        {/* Personal Message */}
        <div className="space-y-3">
          <h3 className="text-white font-bold text-lg flex items-center gap-2">
            <MessageSquare className="text-[#D4AF37]" size={20} />
            رسالة شخصية (اختياري)
          </h3>
          <textarea
            name="personalMessage"
            value={formData.personalMessage}
            onChange={handleChange}
            placeholder="اكتب رسالة جميلة للمستلم..."
            rows={4}
            className="w-full bg-[#1A1A1A] border border-[#27272A] text-white rounded-xl p-3 text-right focus:outline-none focus:ring-2 focus:ring-[#D4AF37] resize-none"
          />
        </div>

        {/* Info Note */}
        <div className="bg-[#1A1A1A] border border-[#27272A] rounded-xl p-4">
          <p className="text-[#A1A1AA] text-sm text-center leading-relaxed">
            سيتم إرسال رابط خاص للمستلم عبر WhatsApp أو رسالة نصية 
            <br />
            يمكنه من خلاله اختيار طريقة استلام الهدية
          </p>
        </div>

        {/* Send Button */}
        <Button
          onClick={handleSendGift}
          disabled={sending || !formData.recipientName || !formData.recipientPhone}
          className="w-full bg-gradient-to-r from-[#D4AF37] to-[#F4C430] hover:from-[#F4C430] hover:to-[#D4AF37] text-black font-bold rounded-full h-14 text-lg disabled:opacity-50"
        >
          {sending ? (
            "جاري الإرسال..."
          ) : (
            <>
              <Send className="ml-2" size={20} />
              إرسال الهدية
            </>
          )}
        </Button>
      </div>

      <BottomNav />
    </div>
  );
};

export default SendGiftPage;
