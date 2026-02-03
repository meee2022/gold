import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Check, ChevronLeft, TrendingUp, Package, ArrowUp } from "lucide-react";
import { Button } from "../components/ui/button";
import { Checkbox } from "../components/ui/checkbox";
import { toast } from "sonner";
import { useAuth, apiCall } from "../context/AuthContext";

const ShariaPage = () => {
  const [accepted, setAccepted] = useState(false);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { user } = useAuth();

  const handleAccept = async () => {
    if (!accepted) {
      toast.error("يرجى الموافقة على الشروط الشرعية");
      return;
    }
    
    if (!user) {
      navigate("/auth");
      return;
    }
    
    setLoading(true);
    try {
      await apiCall("post", "/sharia-acceptance", { accepted: true });
      toast.success("تم حفظ الموافقة");
      navigate("/investment");
    } catch (error) {
      toast.error("فشل في حفظ الموافقة");
    }
    setLoading(false);
  };

  const terms = [
    {
      icon: TrendingUp,
      title: "التقابض يداً بيد",
      description: "يتم إتمام عملية البيع والشراء فورياً (Spot Trade) لضمان التقابض الشرعي المعتبر في الذهب والفضة."
    },
    {
      icon: Package,
      title: "التملك المباشر",
      description: "تنتقل ملكية الذهب للمشتري فور إتمام عملية الدفع، مع ضمان الحق في استلام الذهب مادياً أو تخزينه في خزائن مؤمنة."
    },
    {
      icon: ArrowUp,
      title: "شفافية الأسعار",
      description: "يتم تحديث الأسعار لحظياً بناءً على أسعار البورصة العالمية للذهب، مع وضوح كامل في التكاليف والرسوم."
    }
  ];

  const additionalTerms = [
    "يقر العميل بأن كافة العمليات التي تتم عبر منصة زينة وخزينة هي عمليات بيع وشراء ناجزة وفورية.",
    "يلتزم الطرفان بأن يتم سداد كامل القيمة فوراً عبر وسائل الدفع المتاحة، ويعتبر قيد المبلغ في حساب الشركة تقابضاً حكمياً معتبراً.",
    "الذهب المعروض للبيع هو ملك خالص لشركة زينة وخزينة أو في حيازتها القانونية قبل عرضها للبيع.",
    "يتم تحديد وزن وعيار الذهب بدقة متناهية وفقاً للمقاييس العالمية."
  ];

  return (
    <div className="min-h-screen bg-[#FFFBF0] pb-20" data-testid="sharia-page">
      {/* Header */}
      <div className="bg-white px-4 py-3 flex items-center gap-3 border-b border-[#E5E5E5]">
        <button onClick={() => navigate(-1)} className="p-2">
          <ChevronLeft size={24} className="text-[#0A0A0A] flip-rtl" />
        </button>
        <h1 className="text-[#0A0A0A] font-bold font-['Cairo'] flex-1 text-right">اتفاقية التقابض والشروط الشرعية</h1>
      </div>

      <div className="p-4">
        {/* Icon */}
        <div className="flex justify-center py-6">
          <div className="w-20 h-20 rounded-full bg-[#D4AF37]/20 flex items-center justify-center">
            <Check size={40} className="text-[#D4AF37]" />
          </div>
        </div>

        {/* Title */}
        <h2 className="text-2xl font-bold text-[#0A0A0A] text-center font-['Cairo'] mb-2">
          الالتزام بالشريعة الإسلامية
        </h2>
        <p className="text-[#666] text-center text-sm mb-6 px-2">
          تتم جميع المعاملات في "زينة وخزينة" وفقاً للضوابط الشرعية المعتمدة لتجارة الذهب والمجوهرات لضمان خلوها من الربا والغرر.
        </p>

        {/* Terms Cards */}
        <div className="space-y-3 mb-6">
          {terms.map((term, index) => (
            <div key={index} className="bg-white border border-[#E5E5E5] rounded-xl p-4 flex gap-4">
              <div className="flex-1 text-right">
                <h3 className="font-bold text-[#0A0A0A] font-['Cairo'] mb-1">{term.title}</h3>
                <p className="text-[#666] text-sm leading-relaxed">{term.description}</p>
              </div>
              <div className="w-12 h-12 rounded-xl bg-[#D4AF37]/10 flex items-center justify-center flex-shrink-0">
                <term.icon className="text-[#D4AF37]" size={24} />
              </div>
            </div>
          ))}
        </div>

        {/* Agreement Checkbox */}
        <div className="flex items-center gap-3 mb-4 p-4 bg-white rounded-xl border border-[#E5E5E5]">
          <label htmlFor="sharia-accept" className="text-[#0A0A0A] text-sm cursor-pointer flex-1 text-right">
            لقد قرأت الشروط الشرعية وأوافق على ما ورد فيها
          </label>
          <Checkbox
            id="sharia-accept"
            checked={accepted}
            onCheckedChange={setAccepted}
            className="data-[state=checked]:bg-[#D4AF37] data-[state=checked]:border-[#D4AF37]"
            data-testid="sharia-checkbox"
          />
        </div>

        {/* Accept Button */}
        <Button
          onClick={handleAccept}
          disabled={loading || !accepted}
          className="w-full bg-[#D4AF37] hover:bg-[#F4C430] text-black font-bold rounded-full h-12 disabled:opacity-50"
          data-testid="accept-sharia-btn"
        >
          {loading ? "جاري الحفظ..." : "موافق والاستمرار"}
        </Button>

        {/* Additional Terms */}
        <div className="mt-6 space-y-3 text-[#666] text-sm bg-white rounded-xl p-4 border border-[#E5E5E5]">
          {additionalTerms.map((term, index) => (
            <p key={index} className="text-right leading-relaxed">
              {index + 1}. {term}
            </p>
          ))}
        </div>
      </div>
    </div>
  );
};

export default ShariaPage;
