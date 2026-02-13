import { useState, useEffect, useRef } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import axios from "axios";
import { ChevronLeft, ArrowRight } from "lucide-react";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { toast } from "sonner";
import { useAuth, API } from "../context/AuthContext";

const AuthPage = () => {
  const [mode, setMode] = useState("login"); // login, register, forgot, reset
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [resetToken, setResetToken] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { login, register, loginWithGoogle, user } = useAuth();

  useEffect(() => {
    if (user) {
      navigate("/");
    }
  }, [user, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      if (mode === "login") {
        await login(email, password);
        toast.success("تم تسجيل الدخول بنجاح");
        navigate("/");
      } else if (mode === "register") {
        await register(name, email, password);
        toast.success("تم إنشاء الحساب بنجاح");
        navigate("/");
      } else if (mode === "forgot") {
        const response = await axios.post(`${API}/auth/forgot-password`, { email });
        toast.success("تم إرسال رمز إعادة التعيين");
        // If debug_token is returned (no email configured), show it
        if (response.data.debug_token) {
          setResetToken(response.data.debug_token.substring(0, 8));
          toast.info(`رمز إعادة التعيين: ${response.data.debug_token.substring(0, 8)}`);
        }
        setMode("reset");
      } else if (mode === "reset") {
        await axios.post(`${API}/auth/reset-password`, {
          token: resetToken,
          new_password: newPassword
        });
        toast.success("تم تغيير كلمة المرور بنجاح");
        setMode("login");
        setResetToken("");
        setNewPassword("");
      }
    } catch (error) {
      toast.error(error.response?.data?.detail || "حدث خطأ");
    }
    setLoading(false);
  };

  const renderForm = () => {
    if (mode === "forgot") {
      return (
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="text-center mb-6">
            <h2 className="text-xl font-bold text-white font-['Cairo']">نسيت كلمة المرور؟</h2>
            <p className="text-[#A1A1AA] text-sm mt-2">أدخل بريدك الإلكتروني لإرسال رمز إعادة التعيين</p>
          </div>
          
          <div>
            <label className="text-white text-sm mb-2 block">البريد الإلكتروني</label>
            <Input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="example@email.com"
              required
              className="bg-[#1A1A1A] border-[#27272A] text-white h-12 rounded-xl"
              data-testid="forgot-email-input"
            />
          </div>

          <Button
            type="submit"
            disabled={loading}
            className="w-full bg-[#D4AF37] hover:bg-[#F4C430] text-black font-bold rounded-full h-12 gold-glow"
            data-testid="send-reset-btn"
          >
            {loading ? "جاري الإرسال..." : "إرسال رمز إعادة التعيين"}
          </Button>

          <button
            type="button"
            onClick={() => setMode("login")}
            className="w-full text-[#D4AF37] text-sm flex items-center justify-center gap-2"
          >
            <ArrowRight size={16} className="flip-rtl" />
            العودة لتسجيل الدخول
          </button>
        </form>
      );
    }

    if (mode === "reset") {
      return (
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="text-center mb-6">
            <h2 className="text-xl font-bold text-white font-['Cairo']">إعادة تعيين كلمة المرور</h2>
            <p className="text-[#A1A1AA] text-sm mt-2">أدخل الرمز المرسل وكلمة المرور الجديدة</p>
          </div>

          <div>
            <label className="text-white text-sm mb-2 block">رمز إعادة التعيين</label>
            <Input
              type="text"
              value={resetToken}
              onChange={(e) => setResetToken(e.target.value)}
              placeholder="أدخل الرمز (8 أحرف)"
              required
              maxLength={8}
              className="bg-[#1A1A1A] border-[#27272A] text-white h-12 rounded-xl text-center tracking-widest font-mono"
              data-testid="reset-token-input"
            />
          </div>

          <div>
            <label className="text-white text-sm mb-2 block">كلمة المرور الجديدة</label>
            <Input
              type="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              placeholder="••••••••"
              required
              minLength={6}
              className="bg-[#1A1A1A] border-[#27272A] text-white h-12 rounded-xl"
              data-testid="new-password-input"
            />
          </div>

          <Button
            type="submit"
            disabled={loading}
            className="w-full bg-[#D4AF37] hover:bg-[#F4C430] text-black font-bold rounded-full h-12 gold-glow"
            data-testid="reset-password-btn"
          >
            {loading ? "جاري التغيير..." : "تغيير كلمة المرور"}
          </Button>

          <button
            type="button"
            onClick={() => setMode("login")}
            className="w-full text-[#D4AF37] text-sm flex items-center justify-center gap-2"
          >
            <ArrowRight size={16} className="flip-rtl" />
            العودة لتسجيل الدخول
          </button>
        </form>
      );
    }

    // Login or Register form
    return (
      <>
        {/* Google Login - Disabled for now */}
        {/* 
        <Button
          onClick={loginWithGoogle}
          className="w-full bg-white hover:bg-gray-100 text-black font-medium rounded-full h-12 mb-4 flex items-center justify-center gap-3"
          data-testid="google-login-btn"
        >
          <svg width="20" height="20" viewBox="0 0 24 24">
            <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
            <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
            <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
            <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
          </svg>
          المتابعة مع Google
        </Button>
        */}

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {mode === "register" && (
            <div>
              <label className="text-white text-sm mb-2 block">الاسم</label>
              <Input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="أدخل اسمك"
                required
                className="bg-[#1A1A1A] border-[#27272A] text-white h-12 rounded-xl"
                data-testid="name-input"
              />
            </div>
          )}

          <div>
            <label className="text-white text-sm mb-2 block">البريد الإلكتروني</label>
            <Input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="example@email.com"
              required
              className="bg-[#1A1A1A] border-[#27272A] text-white h-12 rounded-xl"
              data-testid="email-input"
            />
          </div>

          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-white text-sm">كلمة المرور</label>
              {mode === "login" && (
                <button
                  type="button"
                  onClick={() => setMode("forgot")}
                  className="text-[#D4AF37] text-sm hover:underline"
                  data-testid="forgot-password-link"
                >
                  نسيت كلمة المرور؟
                </button>
              )}
            </div>
            <Input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              required
              className="bg-[#1A1A1A] border-[#27272A] text-white h-12 rounded-xl"
              data-testid="password-input"
            />
          </div>

          <Button
            type="submit"
            disabled={loading}
            className="w-full bg-[#D4AF37] hover:bg-[#F4C430] text-black font-bold rounded-full h-12 gold-glow"
            data-testid="submit-auth-btn"
          >
            {loading ? "جاري التحميل..." : mode === "login" ? "تسجيل الدخول" : "إنشاء حساب"}
          </Button>
        </form>

        {/* Toggle Mode */}
        <p className="text-center mt-6 text-[#A1A1AA]">
          {mode === "login" ? "ليس لديك حساب؟" : "لديك حساب بالفعل؟"}
          <button
            onClick={() => setMode(mode === "login" ? "register" : "login")}
            className="text-[#D4AF37] font-bold mr-2"
            data-testid="toggle-auth-mode"
          >
            {mode === "login" ? "إنشاء حساب" : "تسجيل الدخول"}
          </button>
        </p>
      </>
    );
  };

  return (
    <div className="min-h-screen bg-[#050505] flex flex-col" data-testid="auth-page">
      {/* Header */}
      <div className="p-4">
        <button onClick={() => navigate("/")} className="p-2">
          <ChevronLeft size={24} className="text-[#D4AF37] flip-rtl" />
        </button>
      </div>

      {/* Content */}
      <div className="flex-1 px-6 py-8">
        {/* Logo */}
        <div className="text-center mb-8">
          <img src="/logo.png" alt="زينة وخزينة" className="h-24 w-24 mx-auto mb-4 object-contain" />
          <h1 className="text-3xl font-bold text-[#D4AF37] font-['Cairo']">زينة وخزينة</h1>
          <p className="text-[#A1A1AA] text-sm mt-2">ZEINA & KHAZINA</p>
        </div>

        {renderForm()}
      </div>
    </div>
  );
};

// Auth Callback Page
const AuthCallback = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { setUser, setToken } = useAuth();
  const hasProcessed = useRef(false);

  useEffect(() => {
    if (hasProcessed.current) return;
    hasProcessed.current = true;

    const processSession = async () => {
      const hash = location.hash;
      const sessionId = hash.split("session_id=")[1]?.split("&")[0];

      if (!sessionId) {
        navigate("/auth");
        return;
      }

      try {
        const response = await axios.post(`${API}/auth/session`, { session_id: sessionId }, { withCredentials: true });
        localStorage.setItem("token", response.data.token);
        setToken(response.data.token);
        setUser(response.data.user);
        navigate("/", { replace: true });
      } catch (error) {
        console.error("Auth callback error:", error);
        toast.error("فشل في تسجيل الدخول");
        navigate("/auth");
      }
    };

    processSession();
  }, [location.hash, navigate, setUser, setToken]);

  return (
    <div className="min-h-screen bg-[#050505] flex items-center justify-center">
      <div className="text-center">
        <div className="w-12 h-12 border-4 border-[#D4AF37] border-t-transparent rounded-full animate-spin mx-auto mb-4" />
        <p className="text-[#A1A1AA]">جاري تسجيل الدخول...</p>
      </div>
    </div>
  );
};

export { AuthPage, AuthCallback };
export default AuthPage;
