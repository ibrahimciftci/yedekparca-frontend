import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { User, Mail, ShieldCheck, CalendarDays, ArrowLeft } from "lucide-react";
import userService from "../services/userService";
import type { UserResponse } from "../types/api";

export default function ProfilePage() {
    const [user, setUser] = useState<UserResponse | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    const navigate = useNavigate();

    useEffect(() => {
        const fetchProfile = async () => {
            try {
                const response = await userService.getProfile();
                setUser(response.data.data);
            } catch {
                setError("Profil bilgileri alınamadı. Lütfen tekrar giriş yapın.");
            } finally {
                setLoading(false);
            }
        };

        fetchProfile();
    }, []);

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-slate-950 text-white">
                Profil bilgileri yükleniyor...
            </div>
        );
    }

    if (error || !user) {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center gap-4 bg-slate-950 text-white">
                <p className="text-red-400">{error || "Kullanıcı bulunamadı."}</p>
                <button
                    onClick={() => navigate("/login")}
                    className="rounded-lg bg-orange-500 px-5 py-3 font-semibold text-white"
                >
                    Giriş Yap
                </button>
            </div>
        );
    }

    const roleLabels: Record<string, string> = {
        CUSTOMER: "Müşteri",
        SELLER: "Satıcı",
        ADMIN: "Yönetici",
    };

    return (
        <div className="min-h-screen bg-slate-950 px-5 py-12 text-white">
            <div className="mx-auto max-w-2xl">
                <Link
                    to="/"
                    className="mb-8 inline-flex items-center gap-2 text-slate-400 transition hover:text-orange-400"
                >
                    <ArrowLeft size={18} />
                    Ana sayfaya dön
                </Link>

                <div className="overflow-hidden rounded-2xl border border-slate-800 bg-slate-900 shadow-xl">
                    <div className="bg-gradient-to-r from-slate-800 to-slate-900 p-8">
                        <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-orange-500">
                            <User size={32} />
                        </div>

                        <h1 className="text-2xl font-bold">Hesabım</h1>
                        <p className="mt-2 text-slate-400">
                            Kişisel hesap bilgilerin
                        </p>
                    </div>

                    <div className="space-y-6 p-8">
                        <div className="flex items-center gap-4">
                            <User className="text-orange-400" size={22} />
                            <div>
                                <p className="text-sm text-slate-400">Ad Soyad</p>
                                <p className="font-semibold">
                                    {user.firstName} {user.lastName}
                                </p>
                            </div>
                        </div>

                        <div className="flex items-center gap-4">
                            <Mail className="text-orange-400" size={22} />
                            <div>
                                <p className="text-sm text-slate-400">E-posta</p>
                                <p className="font-semibold">{user.email}</p>
                            </div>
                        </div>

                        <div className="flex items-center gap-4">
                            <ShieldCheck className="text-orange-400" size={22} />
                            <div>
                                <p className="text-sm text-slate-400">Hesap Rolü</p>
                                <p className="font-semibold">
                                    {roleLabels[user.role] ?? user.role}
                                </p>
                            </div>
                        </div>

                        <div className="flex items-center gap-4">
                            <CalendarDays className="text-orange-400" size={22} />
                            <div>
                                <p className="text-sm text-slate-400">Kayıt Tarihi</p>
                                <p className="font-semibold">
                                    {new Date(user.createdAt).toLocaleDateString("tr-TR")}
                                </p>
                            </div>
                        </div>

                        {user.role === "SELLER" && (
                            <Link
                                to="/seller/products"
                                className="inline-flex rounded-lg bg-orange-500 px-5 py-3 font-semibold text-white transition hover:bg-orange-600"
                            >
                                Ürünlerimi Yönet
                            </Link>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
