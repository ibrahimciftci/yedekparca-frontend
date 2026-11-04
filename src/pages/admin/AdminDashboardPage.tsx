import {
    Users,
    Store,
    Package,
    ClipboardList,
    ArrowRight,
} from "lucide-react";

import { Link } from "react-router-dom";

function AdminDashboardPage() {
    const cards = [
        {
            title: "Toplam Kullanıcı",
            value: "—",
            description: "Platformdaki kayıtlı kullanıcılar",
            icon: Users,
        },
        {
            title: "Satıcı Başvuruları",
            value: "—",
            description: "İncelenmeyi bekleyen başvurular",
            icon: Store,
        },
        {
            title: "Toplam Ürün",
            value: "—",
            description: "Platformda listelenen ürünler",
            icon: Package,
        },
        {
            title: "Bekleyen İşlemler",
            value: "—",
            description: "Yönetici incelemesi gereken işlemler",
            icon: ClipboardList,
        },
    ];

    return (
        <div>
            <div className="mb-8">
                <h1 className="text-2xl font-bold text-[#101d35]">
                    Dashboard
                </h1>
                <p className="mt-2 text-slate-500">
                    YedekParça platformunun yönetim merkezine hoş geldin.
                </p>
            </div>

            <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-4">
                {cards.map((card) => {
                    const Icon = card.icon;

                    return (
                        <div
                            key={card.title}
                            className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm"
                        >
                            <div className="flex items-center justify-between">
                                <span className="text-sm font-medium text-slate-500">
                                    {card.title}
                                </span>

                                <div className="rounded-xl bg-orange-50 p-3 text-orange-500">
                                    <Icon size={22} />
                                </div>
                            </div>

                            <p className="mt-5 text-3xl font-bold text-[#101d35]">
                                {card.value}
                            </p>

                            <p className="mt-2 text-xs text-slate-400">
                                {card.description}
                            </p>
                        </div>
                    );
                })}
            </div>

            <div className="mt-8 rounded-2xl border border-slate-200 bg-white p-7 shadow-sm">
                <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
                    <div>
                        <h2 className="text-lg font-bold text-[#101d35]">
                            Satıcı Başvurularını Yönet
                        </h2>

                        <p className="mt-2 text-sm text-slate-500">
                            Yeni satıcı başvurularını inceleyebilir, onaylayabilir
                            veya reddedebilirsin.
                        </p>
                    </div>

                    <Link
                        to="/admin/sellers"
                        className="inline-flex items-center justify-center gap-2 rounded-lg bg-orange-500 px-5 py-3 text-sm font-semibold text-white transition hover:bg-orange-600"
                    >
                        Başvuruları Görüntüle
                        <ArrowRight size={18} />
                    </Link>
                </div>
            </div>
        </div>
    );
}

export default AdminDashboardPage;