import { useNavigate } from "react-router-dom";
import { ChevronLeft, ChevronRight, Shield, Landmark, Headphones, Lock, Phone, Mail, Globe } from "lucide-react";

const AboutPage = () => {
  const navigate = useNavigate();

  const features = [
    { icon: Shield, title: "نقاء مضمون", subtitle: "عيار 24 و 22 معتمد دولياً" },
    { icon: Landmark, title: "تراث قطري", subtitle: "تصاميم تحاكي روح الدوحة" },
    { icon: Lock, title: "تخزين آمن", subtitle: "خزائن مؤمنة بالكامل" },
    { icon: Headphones, title: "دعم محلي", subtitle: "فريق متخصص في خدمتك" },
  ];

  const paymentMethods = [
    { name: "VISA", icon: "💳" },
    { name: "MASTERCARD", icon: "💳" },
    { name: "BANK TRANSFER", icon: "🏦" },
  ];

  return (
    <div className="min-h-screen bg-[#1A1A0F] pb-20" data-testid="about-page">
      {/* Header */}
      <div className="bg-[#1A1A0F] px-4 py-3 flex items-center justify-between border-b border-[#2A2A1F]">
        <button onClick={() => navigate(-1)} className="p-2 text-[#D4AF37]">
          <ChevronRight size={24} />
        </button>
        <h1 className="text-[#D4AF37] font-bold font-['Cairo'] text-lg">عن زينة وخزينة</h1>
        <button onClick={() => navigate(1)} className="p-2 text-[#D4AF37]">
          <ChevronLeft size={24} />
        </button>
      </div>

      {/* Hero Section */}
      <div className="px-4 py-6">
        <div className="relative rounded-2xl overflow-hidden bg-gradient-to-br from-[#2A2A1F] to-[#1A1A0F] border border-[#3A3A2F] p-6">
          <div className="absolute top-0 left-0 right-0 h-20 bg-gradient-to-b from-[#8B7355]/20 to-transparent" />
          <div className="relative text-center">
            {/* Logo */}
            <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-[#D4AF37] flex items-center justify-center">
              <svg viewBox="0 0 100 100" className="w-12 h-12 text-black">
                <polygon points="50,15 85,50 50,85 15,50" fill="currentColor" />
                <polygon points="50,25 75,50 50,75 25,50" fill="#1A1A0F" />
              </svg>
            </div>
            <h2 className="text-[#D4AF37] font-bold text-xl font-['Cairo'] tracking-wide">ZEINA & KHAZINA</h2>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="px-4">
        <h2 className="text-[#D4AF37] font-bold text-xl text-center font-['Cairo'] mb-3">
          نحو تجربة استثمار ذهب استثنائية في قطر
        </h2>
        <p className="text-[#A1A1AA] text-center text-sm leading-relaxed mb-6">
          تأسست زينة وخزينة لتكون الوجهة الأولى والآمنة في قطر لتداول الذهب والمجوهرات الفاخرة. نسعى لدمج عراقة التقاليد القطرية مع سهولة التكنولوجيا الحديثة لنجعل من شراء واستثمار الذهب تجربة غنية وميسرة للجميع.
        </p>

        {/* Why Choose Us */}
        <div className="mb-6">
          <h3 className="text-[#D4AF37] font-bold text-lg text-right font-['Cairo'] mb-4">لماذا تختارنا؟</h3>
          <div className="grid grid-cols-2 gap-3">
            {features.map((feature, index) => (
              <div 
                key={index}
                className="bg-[#2A2A1F] border border-[#3A3A2F] rounded-xl p-4 text-right"
              >
                <div className="w-10 h-10 rounded-lg bg-[#D4AF37]/20 flex items-center justify-center mb-3 mr-auto">
                  <feature.icon size={20} className="text-[#D4AF37]" />
                </div>
                <h4 className="text-[#D4AF37] font-bold text-sm font-['Cairo']">{feature.title}</h4>
                <p className="text-[#A1A1AA] text-xs mt-1">{feature.subtitle}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Safe Payments */}
        <div className="bg-[#2A2A1F] border border-[#3A3A2F] rounded-xl p-4 mb-6">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 rounded-lg bg-[#D4AF37]/20 flex items-center justify-center">
              <Shield size={20} className="text-[#D4AF37]" />
            </div>
            <h3 className="text-[#D4AF37] font-bold font-['Cairo']">مدفوعات آمنة وموثوقة</h3>
          </div>
          <p className="text-[#A1A1AA] text-sm text-right mb-4">
            نستخدم أحدث تقنيات التشفير لضمان سلامة معاملاتك المالية. جميع العمليات تتم من خلال بوابات دفع معتمدة من مصرف قطر المركزي.
          </p>
          <div className="flex justify-center gap-6">
            <div className="text-center">
              <div className="w-12 h-8 bg-[#1A1A0F] rounded flex items-center justify-center mb-1">
                <span className="text-[#D4AF37] text-xs font-bold">VISA</span>
              </div>
              <span className="text-[#A1A1AA] text-[10px]">VISA</span>
            </div>
            <div className="text-center">
              <div className="w-12 h-8 bg-[#1A1A0F] rounded flex items-center justify-center mb-1">
                <span className="text-[#D4AF37] text-xs font-bold">MC</span>
              </div>
              <span className="text-[#A1A1AA] text-[10px]">MASTERCARD</span>
            </div>
            <div className="text-center">
              <div className="w-12 h-8 bg-[#1A1A0F] rounded flex items-center justify-center mb-1">
                <Landmark size={16} className="text-[#D4AF37]" />
              </div>
              <span className="text-[#A1A1AA] text-[10px]">BANK TRANSFER</span>
            </div>
          </div>
        </div>

        {/* Contact */}
        <div className="flex justify-center gap-8 py-4">
          <button className="w-12 h-12 rounded-full bg-[#2A2A1F] border border-[#3A3A2F] flex items-center justify-center">
            <Phone size={20} className="text-[#D4AF37]" />
          </button>
          <button className="w-12 h-12 rounded-full bg-[#2A2A1F] border border-[#3A3A2F] flex items-center justify-center">
            <Mail size={20} className="text-[#D4AF37]" />
          </button>
          <button className="w-12 h-12 rounded-full bg-[#2A2A1F] border border-[#3A3A2F] flex items-center justify-center">
            <Globe size={20} className="text-[#D4AF37]" />
          </button>
        </div>

        {/* Footer */}
        <div className="text-center py-4 border-t border-[#2A2A1F] mt-4">
          <p className="text-[#A1A1AA] text-xs">
            حقوق الطبع والنشر © 2024 زينة وخزينة. جميع الحقوق محفوظة لشركة الذهب والجمال - قطر.
          </p>
        </div>
      </div>
    </div>
  );
};

export default AboutPage;
