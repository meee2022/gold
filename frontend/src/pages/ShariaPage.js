import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Check, ChevronLeft, TrendingUp, Package, ArrowUp } from "lucide-react";
import { Button } from "../components/ui/button";
import { Card, CardContent } from "../components/ui/card";
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

  if (!user) {
    navigate("/auth");
    return null;
  }

  return (
    <div className="min-h-screen bg-[#FAFAFA] pb-20" data-testid="sharia-page">
      {/* Header */}
      <div className="bg-[#0A0A0A] px-4 py-3 flex items-center gap-3">
        <button onClick={() => navigate(-1)} className="p-2">
          <ChevronLeft size={24} className="text-white flip-rtl" />
        </button>
        <h1 className="text-white font-bold font-['Cairo']">اتفاقية التقابض والشروط الشرعية</h1>
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
        <p className="text-[#666] text-center text-sm mb-6">
          تتم جميع المعاملات في "زينة وخزينة" وفقاً للضوابط الشرعية المعتمدة لتجارة الذهب والمجوهرات لضمان خلوها من الربا والغرر.
        </p>

        {/* Terms Cards */}
        <div className="space-y-3 mb-6">
          <Card className="bg-white border-[#E5E5E5]">
            <CardContent className="p-4 flex gap-4">
              <div className="w-12 h-12 rounded-xl bg-[#D4AF37]/10 flex items-center justify-center flex-shrink-0">
                <TrendingUp className="text-[#D4AF37]" />
              </div>
              <div>
                <h3 className="font-bold text-[#0A0A0A] font-['Cairo']">التقابض يداً بيد</h3>
                <p className="text-[#666] text-sm">يتم إتمام عملية البيع والشراء فورياً (Spot Trade) لضمان التقابض الشرعي المعتبر في الذهب والفضة.</p>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white border-[#E5E5E5]">
            <CardContent className="p-4 flex gap-4">
              <div className="w-12 h-12 rounded-xl bg-[#D4AF37]/10 flex items-center justify-center flex-shrink-0">
                <Package className="text-[#D4AF37]" />
              </div>
              <div>
                <h3 className="font-bold text-[#0A0A0A] font-['Cairo']">التملك المباشر</h3>
                <p className="text-[#666] text-sm">تنتقل ملكية الذهب للمشتري فور إتمام عملية الدفع، مع ضمان الحق في استلام الذهب مادياً أو تخزينه في خزائن مؤمنة.</p>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white border-[#E5E5E5]">
            <CardContent className="p-4 flex gap-4">
              <div className="w-12 h-12 rounded-xl bg-[#D4AF37]/10 flex items-center justify-center flex-shrink-0">
                <ArrowUp className="text-[#D4AF37]" />
              </div>
              <div>
                <h3 className="font-bold text-[#0A0A0A] font-['Cairo']">شفافية الأسعار</h3>
                <p className="text-[#666] text-sm">يتم تحديث الأسعار لحظياً بناءً على أسعار البورصة العالمية للذهب، مع وضوح كامل في التكاليف والرسوم.</p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Agreement Checkbox */}
        <div className="flex items-start gap-3 mb-6 p-4 bg-white rounded-xl border border-[#E5E5E5]">
          <Checkbox
            id="sharia-accept"
            checked={accepted}
            onCheckedChange={setAccepted}
            className="mt-1 data-[state=checked]:bg-[#D4AF37] data-[state=checked]:border-[#D4AF37]"
            data-testid="sharia-checkbox"
          />
          <label htmlFor="sharia-accept" className="text-[#0A0A0A] text-sm cursor-pointer">
            لقد قرأت الشروط الشرعية وأوافق على ما ورد فيها
          </label>
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
        <div className="mt-6 space-y-2 text-[#666] text-sm">
          <p>1. يقر العميل بأن كافة العمليات التي تتم عبر منصة زينة وخزينة هي عمليات بيع وشراء ناجزة وفورية.</p>
          <p>2. يلتزم الطرفان بأن يتم سداد كامل القيمة فوراً عبر وسائل الدفع المتاحة، ويعتبر قيد المبلغ في حساب الشركة تقابضاً حكمياً معتبراً.</p>
          <p>3. الذهب المعروض للبيع هو ملك خالص لشركة زينة وخزينة أو في حيازتها القانونية قبل عرضها للبيع.</p>
          <p>4. يتم تحديد وزن وعيار الذهب بدقة متناهية وفقاً للمقاييس العالمية.</p>
        </div>
      </div>
    </div>
  );
};

export default ShariaPage;
