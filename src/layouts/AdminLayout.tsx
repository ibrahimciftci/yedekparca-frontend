import {
    LayoutDashboard,
    Users,
    Store,
    Package,
    LogOut,
    ShieldCheck,
} from "lucide-react";

import { Link, NavLink, Outlet, useNavigate } from "react-router-dom";

function AdminLayout() {
    const navigate = useNavigate();

    const handleLogout = () => {
        localStorage.removeItem("token");
        navigate("/login");
    };

    const menuItems = [
        {
            title: "Dashboard",
            path: "/admin",
            icon: LayoutDashboard,
            end: true,
        },
        {
            title: "Kullanıcılar",
            path: "/admin/users",
            icon: Users,
        },
        {
            title: "Satıcı Başvuruları",
            path: "/admin/sellers",
            icon: Store,
        },
        {
            title: "Ürünler",
            path: "/admin/products",
            icon: Package,
        },
    ];

    return (
        <div className="flex min-h-screen bg-slate-100">
            <aside className="flex w-64 shrink-0 flex-col bg-[#101d35] text-white">
                <Link
                    to="/admin"
                    className="flex items-center gap-3 border-b border-slate-700 px-6 py-6"
                >
                    <ShieldCheck className="text-orange-500" size={28} />
                    <div>
                        <h1 className="text-lg font-bold">YedekParça</h1>
                        <p className="text-xs text-slate-400">
                            Yönetim Paneli
                        </p>
                    </div>
                </Link>

                <nav className="flex-1 space-y-2 px-4 py-6">
                    {menuItems.map((item) => {
                        const Icon = item.icon;

                        return (
                            <NavLink
                                key={item.path}
                                to={item.path}
                                end={item.end}
                                className={({ isActive }) =>
                                    `flex items-center gap-3 rounded-lg px-4 py-3 text-sm transition ${
                                        isActive
                                            ? "bg-orange-500 font-semibold text-white"
                                            : "text-slate-300 hover:bg-slate-800 hover:text-white"
                                    }`
                                }
                            >
                                <Icon size={19} />
                                {item.title}
                            </NavLink>
                        );
                    })}
                </nav>

                <div className="border-t border-slate-700 p-4">
                    <button
                        onClick={handleLogout}
                        className="flex w-full items-center gap-3 rounded-lg px-4 py-3 text-sm text-slate-300 transition hover:bg-red-500/10 hover:text-red-400"
                    >
                        <LogOut size={19} />
                        Çıkış Yap
                    </button>
                </div>
            </aside>

            <main className="min-w-0 flex-1">
                <header className="flex h-20 items-center justify-between border-b border-slate-200 bg-white px-8">
                    <div>
                        <h2 className="text-lg font-bold text-[#101d35]">
                            Yönetim Merkezi
                        </h2>
                        <p className="text-sm text-slate-500">
                            Platform yönetimi
                        </p>
                    </div>

                    <span className="rounded-full bg-orange-50 px-4 py-2 text-sm font-semibold text-orange-600">
                        Admin
                    </span>
                </header>

                <div className="p-8">
                    <Outlet />
                </div>
            </main>
        </div>
    );
}

export default AdminLayout;