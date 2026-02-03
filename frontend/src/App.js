import { BrowserRouter, Routes, Route, useLocation } from "react-router-dom";
import { Toaster } from "sonner";
import { AuthProvider } from "./context/AuthContext";
import HomePage from "./pages/HomePage";
import InvestmentPage from "./pages/InvestmentPage";
import GiftsPage from "./pages/GiftsPage";
import StorePage from "./pages/StorePage";
import CartPage from "./pages/CartPage";
import ShariaPage from "./pages/ShariaPage";
import AboutPage from "./pages/AboutPage";
import AuthPage, { AuthCallback } from "./pages/AuthPage";
import ProfilePage from "./pages/ProfilePage";
import OrdersPage from "./pages/OrdersPage";
import AdminPage from "./pages/AdminPage";
import DesignersPage from "./pages/DesignersPage";
import DesignerDetailPage from "./pages/DesignerDetailPage";
import "./App.css";

// App Router - handles session_id detection for OAuth
function AppRouter() {
  const location = useLocation();

  // Check URL fragment for session_id (Emergent OAuth callback)
  if (location.hash?.includes('session_id=')) {
    return <AuthCallback />;
  }

  return (
    <Routes>
      <Route path="/" element={<HomePage />} />
      <Route path="/investment" element={<InvestmentPage />} />
      <Route path="/gifts" element={<GiftsPage />} />
      <Route path="/store" element={<StorePage />} />
      <Route path="/cart" element={<CartPage />} />
      <Route path="/sharia" element={<ShariaPage />} />
      <Route path="/about" element={<AboutPage />} />
      <Route path="/auth" element={<AuthPage />} />
      <Route path="/auth/callback" element={<AuthCallback />} />
      <Route path="/profile" element={<ProfilePage />} />
      <Route path="/orders" element={<OrdersPage />} />
      <Route path="/admin" element={<AdminPage />} />
      <Route path="/designers" element={<DesignersPage />} />
      <Route path="/designers/:designerId" element={<DesignerDetailPage />} />
      <Route path="*" element={<HomePage />} />
    </Routes>
  );
}

function App() {
  return (
    <AuthProvider>
      <div className="App" dir="rtl">
        <Toaster position="top-center" richColors />
        <BrowserRouter>
          <AppRouter />
        </BrowserRouter>
      </div>
    </AuthProvider>
  );
}

export default App;
