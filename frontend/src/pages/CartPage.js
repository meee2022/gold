import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { ShoppingBag, Plus, Minus, X, CreditCard } from "lucide-react";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { toast } from "sonner";
import { useAuth, apiCall } from "../context/AuthContext";
import { BottomNav, TopHeader } from "../components/Navigation";

const CartPage = () => {
  const [cart, setCart] = useState({ items: [], total: 0 });
  const [loading, setLoading] = useState(true);
  const [couponCode, setCouponCode] = useState("");
  const navigate = useNavigate();
  const { user } = useAuth();

  useEffect(() => {
    if (user) {
      fetchCart();
    } else {
      setLoading(false);
    }
  }, [user]);

  const fetchCart = async () => {
    try {
      const response = await apiCall("get", "/cart");
      setCart(response.data);
    } catch (error) {
      console.error(error);
    }
    setLoading(false);
  };

  const updateQuantity = async (productId, quantity) => {
    try {
      await apiCall("put", "/cart/update", { product_id: productId, quantity });
      fetchCart();
    } catch (error) {
      toast.error("فشل في التحديث");
    }
  };

  const removeItem = async (productId) => {
    try {
      await apiCall("delete", `/cart/remove/${productId}`);
      fetchCart();
      toast.success("تم الحذف");
    } catch (error) {
      toast.error("فشل في الحذف");
    }
  };

  const handleCheckout = async () => {
    try {
      const response = await apiCall("post", "/orders", { items: cart.items, coupon_code: couponCode });
      toast.success("تم إنشاء الطلب بنجاح");
      navigate("/orders");
    } catch (error) {
      toast.error(error.response?.data?.detail || "فشل في إنشاء الطلب");
    }
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-[#050505] pb-20">
        <TopHeader title="سلة التسوق" showBack showCart={false} />
        <div className="flex flex-col items-center justify-center h-[60vh] px-4">
          <ShoppingBag size={64} className="text-[#27272A] mb-4" />
          <p className="text-[#A1A1AA] mb-4">يرجى تسجيل الدخول لعرض سلة التسوق</p>
          <Button onClick={() => navigate("/auth")} className="bg-[#D4AF37] hover:bg-[#F4C430] text-black rounded-full">
            تسجيل الدخول
          </Button>
        </div>
        <BottomNav />
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-[#050505] pb-20">
        <TopHeader title="سلة التسوق" showBack showCart={false} />
        <div className="p-4 space-y-4">
          {[1, 2].map(i => <div key={i} className="skeleton h-24 rounded-xl" />)}
        </div>
        <BottomNav />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#050505] pb-32" data-testid="cart-page">
      <TopHeader title="سلة التسوق" showBack showCart={false} />

      {/* Live Price Notice */}
      <div className="px-4 py-3">
        <div className="flex items-center gap-2 text-[#D4AF37] text-sm">
          <div className="w-2 h-2 rounded-full bg-green-500 pulse-live" />
          <span>الأسعار محدثة مباشرة بناءً على سعر الذهب العالمي</span>
        </div>
      </div>

      {cart.items.length === 0 ? (
        <div className="flex flex-col items-center justify-center h-[50vh] px-4">
          <ShoppingBag size={64} className="text-[#27272A] mb-4" />
          <p className="text-[#A1A1AA] mb-4">سلة التسوق فارغة</p>
          <Button onClick={() => navigate("/store")} className="bg-[#D4AF37] hover:bg-[#F4C430] text-black rounded-full">
            تسوق الآن
          </Button>
        </div>
      ) : (
        <>
          {/* Cart Items */}
          <div className="px-4 space-y-3">
            {cart.items.map((item) => (
              <div key={item.product_id} className="flex gap-3 p-3 bg-[#121212] border border-[#27272A] rounded-xl" data-testid={`cart-item-${item.product_id}`}>
                <img src={item.product?.image_url} alt="" className="w-20 h-20 rounded-lg object-cover" />
                <div className="flex-1">
                  <div className="flex items-start justify-between">
                    <div>
                      <h4 className="text-white font-semibold text-sm">{item.product?.title}</h4>
                      <p className="text-[#A1A1AA] text-xs">المورد: {item.product?.merchant_name}</p>
                      {item.product?.weight_grams && (
                        <p className="text-[#A1A1AA] text-xs">الوزن: {item.product.weight_grams} جرام</p>
                      )}
                    </div>
                    <button onClick={() => removeItem(item.product_id)} className="p-1">
                      <X size={18} className="text-[#A1A1AA]" />
                    </button>
                  </div>
                  <div className="flex items-center justify-between mt-2">
                    <span className="text-[#D4AF37] font-bold">{item.product?.price_qar?.toLocaleString()} ر.ق</span>
                    <div className="flex items-center gap-2 bg-[#1A1A1A] rounded-full p-1">
                      <button 
                        onClick={() => updateQuantity(item.product_id, item.quantity - 1)}
                        className="w-7 h-7 rounded-full bg-[#D4AF37] text-black flex items-center justify-center"
                        data-testid="decrease-qty"
                      >
                        <Minus size={14} />
                      </button>
                      <span className="text-white w-6 text-center">{item.quantity}</span>
                      <button 
                        onClick={() => updateQuantity(item.product_id, item.quantity + 1)}
                        className="w-7 h-7 rounded-full bg-[#D4AF37] text-black flex items-center justify-center"
                        data-testid="increase-qty"
                      >
                        <Plus size={14} />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Coupon */}
          <div className="px-4 py-4">
            <div className="flex gap-2">
              <Input
                value={couponCode}
                onChange={(e) => setCouponCode(e.target.value)}
                placeholder="رمز القسيمة"
                className="bg-[#1A1A1A] border-[#D4AF37]/30 text-white flex-1"
                data-testid="coupon-input"
              />
              <Button className="bg-[#D4AF37]/20 text-[#D4AF37] border border-[#D4AF37] hover:bg-[#D4AF37] hover:text-black rounded-lg" data-testid="apply-coupon">
                تطبيق
              </Button>
            </div>
          </div>

          {/* Order Summary */}
          <div className="px-4 py-2">
            <h3 className="text-lg font-bold text-white font-['Cairo'] mb-3">ملخص الطلب</h3>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-[#A1A1AA]">المجموع الفرعي</span>
                <span className="text-white">{cart.total?.toLocaleString()} ر.ق</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#A1A1AA]">رسوم التوصيل (الدوحة)</span>
                <span className="text-green-500">مجاني</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#A1A1AA]">ضريبة القيمة المضافة</span>
                <span className="text-white">0 ر.ق</span>
              </div>
              <div className="border-t border-[#27272A] pt-2 mt-2">
                <div className="flex justify-between">
                  <span className="text-white font-bold">الإجمالي النهائي</span>
                  <span className="text-[#D4AF37] font-bold text-lg">{cart.total?.toLocaleString()} ر.ق</span>
                </div>
              </div>
            </div>
          </div>
        </>
      )}

      {/* Fixed Checkout Button */}
      {cart.items.length > 0 && (
        <div className="fixed bottom-0 left-0 right-0 bg-[#0A0A0A] border-t border-[#27272A] p-4">
          <div className="flex items-center justify-between mb-3">
            <div>
              <span className="text-[#A1A1AA] text-sm">إجمالي العناصر ({cart.items.length})</span>
              <p className="text-[#D4AF37] font-bold">{cart.total?.toLocaleString()} ر.ق</p>
            </div>
            <div className="flex items-center gap-1 text-green-500 text-xs">
              <CreditCard size={14} />
              <span>دفع آمن 100%</span>
            </div>
          </div>
          <Button 
            onClick={handleCheckout}
            className="w-full bg-[#D4AF37] hover:bg-[#F4C430] text-black font-bold rounded-full h-12 gold-glow"
            data-testid="checkout-btn"
          >
            <CreditCard className="ml-2" />
            إتمام عملية الشراء
          </Button>
        </div>
      )}
    </div>
  );
};

export default CartPage;
