import { BrowserRouter, Routes, Route, useLocation } from "react-router-dom";
import { Toaster } from "sonner";
import { AuthProvider } from "./context/AuthContext";
import HomePage from "./pages/HomePage";
import InvestmentPage from "./pages/InvestmentPage";
import GiftsPage from "./pages/GiftsPage";
import GiftCardPage from "./pages/GiftCardPage";
import SendGiftPage from "./pages/SendGiftPage";
import ReceiveGiftPage from "./pages/ReceiveGiftPage";
import PortfolioPage from "./pages/PortfolioPage";
import StorePage from "./pages/StorePage";
import CartPage from "./pages/CartPage";
import ShariaPage from "./pages/ShariaPage";
import AboutPage from "./pages/AboutPage";
import NotificationsPage from "./pages/NotificationsPage";
import AuthPage, { AuthCallback } from "./pages/AuthPage";
import ProfilePage from "./pages/ProfilePage";
import OrdersPage from "./pages/OrdersPage";
import AdminPage from "./pages/AdminPage";
import AdminShopsPage from "./pages/AdminShopsPage";
import AdminShopFormPage from "./pages/AdminShopFormPage";
import AdminShopDetailsPage from "./pages/AdminShopDetailsPage";
import AdminDesignersPage from "./pages/AdminDesignersPage";
import AdminDesignerFormPage from "./pages/AdminDesignerFormPage";
import AdminProductsPage from "./pages/AdminProductsPage";
import AdminProductFormPage from "./pages/AdminProductFormPage";
import AdminUsersPage from "./pages/AdminUsersPage";
import AdminUserDetailsPage from "./pages/AdminUserDetailsPage";
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
      <Route path="/send-gift/:productId" element={<SendGiftPage />} />
      <Route path="/receive-gift/:token" element={<ReceiveGiftPage />} />
      <Route path="/portfolio" element={<PortfolioPage />} />
      <Route path="/store" element={<StorePage />} />
      <Route path="/cart" element={<CartPage />} />
      <Route path="/sharia" element={<ShariaPage />} />
      <Route path="/about" element={<AboutPage />} />
      <Route path="/notifications" element={<NotificationsPage />} />
      <Route path="/auth" element={<AuthPage />} />
      <Route path="/auth/callback" element={<AuthCallback />} />
      <Route path="/profile" element={<ProfilePage />} />
      <Route path="/orders" element={<OrdersPage />} />
      <Route path="/admin" element={<AdminPage />} />
      <Route path="/admin/shops" element={<AdminShopsPage />} />
      <Route path="/admin/shops/new" element={<AdminShopFormPage />} />
      <Route path="/admin/shops/:id" element={<AdminShopDetailsPage />} />
      <Route path="/admin/shops/:id/edit" element={<AdminShopFormPage />} />
      <Route path="/admin/designers" element={<AdminDesignersPage />} />
      <Route path="/admin/designers/new" element={<AdminDesignerFormPage />} />
      <Route path="/admin/designers/:id/edit" element={<AdminDesignerFormPage />} />
      <Route path="/admin/products" element={<AdminProductsPage />} />
      <Route path="/admin/products/new" element={<AdminProductFormPage />} />
      <Route path="/admin/products/:id/edit" element={<AdminProductFormPage />} />
      <Route path="/admin/users" element={<AdminUsersPage />} />
      <Route path="/admin/users/:id" element={<AdminUserDetailsPage />} />
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
