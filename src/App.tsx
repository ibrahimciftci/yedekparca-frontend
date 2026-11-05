import {
  Search,
  CarFront,
  Wrench,
  ShieldCheck,
  Truck,
  Store,
  ArrowRight,
  UserRound,
  LogOut,
} from "lucide-react";

import { BrowserRouter, Routes, Route, Link, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";

import LoginPage from "./pages/LoginPage";
import RegisterPage from "./pages/RegisterPage";
import ProfilePage from "./pages/ProfilePage";
import AdminRoute from "./components/AdminRoute";
import AdminLayout from "./layouts/AdminLayout";
import AdminDashboardPage from "./pages/admin/AdminDashboardPage";
import AdminUsersPage from "./pages/admin/AdminUsersPage";
import AdminSellerApplicationsPage from "./pages/admin/AdminSellerApplicationsPage";
import AdminProductsPage from "./pages/admin/AdminProductsPage";
import ProductCatalogPage from "./pages/ProductCatalogPage";
import ProductDetailPage from "./pages/ProductDetailPage";
import SellerProductsPage from "./pages/SellerProductsPage";
import SellerRoute from "./components/SellerRoute";
import MarketplaceCatalogPage from "./pages/MarketplaceCatalogPage";
import CatalogDetailPage from "./pages/CatalogDetailPage";
import SellerProfilePage from "./pages/SellerProfilePage";
import FavoritesPage from "./pages/FavoritesPage";
import SellerMarketplacePage from "./pages/SellerMarketplacePage";
import AdminMarketplacePage from "./pages/admin/AdminMarketplacePage";

// Ana Sayfa
function HomePage() {
  const navigate = useNavigate();
  const [productSearch, setProductSearch] = useState("");
  const [isAuthenticated, setIsAuthenticated] = useState(
      () => !!localStorage.getItem("token")
  );

  const handleLogout = () => {
    localStorage.removeItem("token");
    setIsAuthenticated(false);
  };

  // Login ve logout işlemlerinden sonra token durumunu kontrol eder.
  useEffect(() => {
    const checkAuthentication = () => {
      setIsAuthenticated(!!localStorage.getItem("token"));
    };

    window.addEventListener("storage", checkAuthentication);

    return () => {
      window.removeEventListener("storage", checkAuthentication);
    };
  }, []);

  return (
      <div className="min-h-screen bg-slate-50">

        {/* Üst Menü */}
        <header className="bg-[#101d35] text-white">
          <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-5">

            <Link to="/" className="text-2xl font-extrabold tracking-tight">
              YEDEK<span className="text-orange-500">PARÇA</span>
            </Link>

            <nav className="hidden items-center gap-8 md:flex">
              <Link to="/" className="text-sm text-slate-300 hover:text-white">
                Ana Sayfa
              </Link>

              <Link to="/products" className="text-sm text-slate-300 hover:text-white">
                Ürünler
              </Link>
              <Link to="/favorites" className="text-sm text-slate-300 hover:text-white">Favorilerim</Link>

              <a href="#" className="text-sm text-slate-300 hover:text-white">
                Satıcılar
              </a>

              <a href="#" className="text-sm text-slate-300 hover:text-white">
                Hakkımızda
              </a>
            </nav>

            <div className="flex items-center gap-3">

              {isAuthenticated ? (
                  <div className="flex items-center gap-3">
                    <Link
                        to="/profile"
                        className="inline-flex items-center gap-2 rounded-lg bg-orange-500 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-orange-600"
                    >
                      <UserRound size={18} />
                      Hesabım
                    </Link>

                    <button
                        onClick={handleLogout}
                        className="inline-flex items-center gap-2 rounded-lg border border-slate-600 px-4 py-2.5 text-sm font-semibold text-slate-200 transition hover:border-red-400 hover:bg-red-500/10 hover:text-red-400"
                    >
                      <LogOut size={18} />
                      Çıkış Yap
                    </button>
                  </div>
              ) : (
                  <>
                    <Link
                        to="/login"
                        className="hidden items-center gap-2 rounded-lg border border-slate-600 px-4 py-2 text-sm transition hover:bg-slate-700 sm:flex"
                    >
                      <UserRound size={17} />
                      Giriş Yap
                    </Link>

                    <Link
                        to="/register"
                        className="rounded-lg bg-orange-500 px-4 py-2 text-sm font-semibold transition hover:bg-orange-600"
                    >
                      Üye Ol
                    </Link>
                  </>
              )}

            </div>

          </div>
        </header>

        {/* Hero Alanı */}
        <section className="bg-[#101d35] px-6 pb-24 pt-16 text-white">
          <div className="mx-auto max-w-7xl">

            <div className="max-w-3xl">
                        <span className="mb-5 inline-block rounded-full border border-orange-400/30 bg-orange-500/10 px-4 py-2 text-sm text-orange-400">
                            Otomotiv Yedek Parça Pazaryeri
                        </span>

              <h1 className="text-4xl font-extrabold leading-tight md:text-6xl">
                Aradığın Yedek Parça,
                <span className="text-orange-500"> Doğru Satıcıda.</span>
              </h1>

              <p className="mt-6 max-w-2xl text-lg leading-8 text-slate-300">
                İhtiyacın olan otomotiv yedek parçalarını keşfet,
                farklı satıcıları ve fiyatları tek platformda karşılaştır.
              </p>
            </div>

            {/* Arama Alanı */}
            <form onSubmit={(event) => { event.preventDefault(); navigate(`/products?search=${encodeURIComponent(productSearch.trim())}`); }} className="mt-10 max-w-4xl rounded-2xl bg-white p-3 shadow-2xl">
              <div className="flex flex-col gap-3 md:flex-row">

                <div className="flex flex-1 items-center gap-3 rounded-xl bg-slate-100 px-4 py-4">
                  <Search className="text-slate-400" />

                  <input
                      type="text"
                      value={productSearch}
                      onChange={(event) => setProductSearch(event.target.value)}
                      placeholder="Ürün adı, OEM numarası veya parça kodu..."
                      className="w-full bg-transparent text-sm text-slate-800 outline-none"
                  />
                </div>

                <button type="submit" className="flex items-center justify-center gap-2 rounded-xl bg-orange-500 px-8 py-4 font-semibold text-white transition hover:bg-orange-600">
                  <Search size={19} />
                  Parça Ara
                </button>

              </div>
            </form>

            <div className="mt-6 flex flex-wrap gap-6 text-sm text-slate-300">

                        <span className="flex items-center gap-2">
                            <ShieldCheck size={18} className="text-orange-400" />
                            Güvenilir Satıcılar
                        </span>

              <span className="flex items-center gap-2">
                            <Truck size={18} className="text-orange-400" />
                            Geniş Ürün Ağı
                        </span>

              <span className="flex items-center gap-2">
                            <Store size={18} className="text-orange-400" />
                            Fiyat Karşılaştırma
                        </span>

            </div>

          </div>
        </section>

        {/* Kategoriler */}
        <section className="mx-auto max-w-7xl px-6 py-20">

          <div className="mb-10 flex items-end justify-between">
            <div>
              <p className="font-semibold text-orange-500">
                KATEGORİLER
              </p>

              <h2 className="mt-2 text-3xl font-bold text-[#101d35]">
                Parçanı Kolayca Bul
              </h2>

              <p className="mt-3 text-slate-500">
                İhtiyacına uygun ürün kategorisini seçerek aramaya başla.
              </p>
            </div>

            <a href="#" className="hidden items-center gap-2 font-semibold text-orange-500 sm:flex">
              Tüm Kategoriler <ArrowRight size={18} />
            </a>
          </div>

          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">

            {[
              {
                title: "Motor Parçaları",
                icon: Wrench,
                description: "Motor ve mekanik aksamlar"
              },
              {
                title: "Kaporta",
                icon: CarFront,
                description: "Kaporta ve dış donanım"
              },
              {
                title: "Elektrik & Elektronik",
                icon: ShieldCheck,
                description: "Elektrik ve elektronik parçalar"
              },
              {
                title: "Araç Aksesuarları",
                icon: Store,
                description: "Aksesuar ve tamamlayıcı ürünler"
              },
            ].map((category) => {
              const Icon = category.icon;

              return (
                  <div
                      key={category.title}
                      role="link"
                      tabIndex={0}
                      onClick={() => navigate(`/products?category=${encodeURIComponent(category.title)}`)}
                      onKeyDown={(event) => { if (event.key === "Enter") navigate(`/products?category=${encodeURIComponent(category.title)}`); }}
                      className="group rounded-2xl border border-slate-200 bg-white p-7 transition hover:-translate-y-1 hover:border-orange-300 hover:shadow-lg"
                  >
                    <div className="mb-6 flex h-14 w-14 items-center justify-center rounded-xl bg-orange-50 text-orange-500">
                      <Icon size={28} />
                    </div>

                    <h3 className="text-lg font-bold text-[#101d35]">
                      {category.title}
                    </h3>

                    <p className="mt-2 text-sm text-slate-500">
                      {category.description}
                    </p>

                    <div className="mt-6 flex items-center gap-2 text-sm font-semibold text-orange-500">
                      Ürünleri İncele <ArrowRight size={16} />
                    </div>
                  </div>
              );
            })}

          </div>
        </section>

        {/* Satıcı Çağrısı */}
        {!isAuthenticated && (
            <section className="mx-auto max-w-7xl px-6 pb-20">
              <div className="flex flex-col items-start justify-between gap-6 rounded-3xl bg-[#101d35] p-10 text-white md:flex-row md:items-center md:p-14">

                <div>
                  <p className="font-semibold text-orange-400">
                    SATIŞA BAŞLA
                  </p>

                  <h2 className="mt-3 text-3xl font-bold">
                    Sen de Satıcılarımız Arasına Katıl
                  </h2>

                  <p className="mt-3 max-w-xl text-slate-300">
                    Ürünlerini listele, daha fazla müşteriye ulaş ve işletmeni büyüt.
                  </p>
                </div>

                <Link
                    to="/register"
                    className="flex shrink-0 items-center gap-2 rounded-xl bg-orange-500 px-6 py-4 font-semibold transition hover:bg-orange-600"
                >
                  Satıcı Başvurusu Yap <ArrowRight size={18} />
                </Link>

              </div>
            </section>
        )}

        {/* Footer */}
        <footer className="bg-[#0b1426] px-6 py-8 text-center text-sm text-slate-400">
          © 2026 YedekParça. Tüm hakları saklıdır.
        </footer>

      </div>
  );
}

// Uygulama yönlendirmeleri
function App() {
  return (
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/profile" element={<ProfilePage />} />
          <Route path="/products" element={<MarketplaceCatalogPage />} />
          <Route path="/legacy-products" element={<ProductCatalogPage />} />
          <Route path="/catalog/:id" element={<CatalogDetailPage />} />
          <Route path="/sellers/:id" element={<SellerProfilePage />} />
          <Route path="/favorites" element={<FavoritesPage />} />
          <Route path="/seller/marketplace" element={<SellerRoute><SellerMarketplacePage /></SellerRoute>} />
          <Route path="/products/:id" element={<ProductDetailPage />} />
          <Route path="/seller/products" element={<SellerRoute><SellerMarketplacePage /></SellerRoute>} />
          <Route path="/legacy-seller/products" element={<SellerRoute><SellerProductsPage /></SellerRoute>} />

          <Route
              path="/admin"
              element={
                <AdminRoute>
                  <AdminLayout />
                </AdminRoute>
              }
          >
            <Route index element={<AdminDashboardPage />} />
            <Route path="users" element={<AdminUsersPage />} />
            <Route path="sellers" element={<AdminSellerApplicationsPage />} />
            <Route path="products" element={<AdminProductsPage />} />
            <Route path="marketplace" element={<AdminMarketplacePage />} />
          </Route>
        </Routes>
      </BrowserRouter>
  );
}

export default App;
