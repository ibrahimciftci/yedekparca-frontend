
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import authService from "../services/authService";

function RegisterPage() {
    const navigate = useNavigate();

    const [firstName, setFirstName] = useState("");
    const [lastName, setLastName] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);

    const handleRegister = async (e: React.FormEvent) => {
        e.preventDefault();
        setError("");
        setLoading(true);

        try {
            await authService.register({
                firstName,
                lastName,
                email,
                password,
            });

            navigate("/login");
        } catch (err: any) {
            setError(
                err.response?.data?.message ||
                "Kayıt işlemi başarısız oldu."
            );
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-slate-100 px-4">
            <div className="w-full max-w-md rounded-2xl bg-white p-8 shadow-lg">

                <h1 className="text-2xl font-bold text-slate-900">
                    Hesap Oluştur
                </h1>

                <p className="mt-2 text-sm text-slate-500">
                    Platformumuza ücretsiz katıl.
                </p>

                <form onSubmit={handleRegister} className="mt-8 space-y-4">

                    <input
                        value={firstName}
                        onChange={(e) => setFirstName(e.target.value)}
                        required
                        placeholder="Ad"
                        className="w-full rounded-lg border border-slate-300 px-4 py-3"
                    />

                    <input
                        value={lastName}
                        onChange={(e) => setLastName(e.target.value)}
                        required
                        placeholder="Soyad"
                        className="w-full rounded-lg border border-slate-300 px-4 py-3"
                    />

                    <input
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                        placeholder="E-posta"
                        className="w-full rounded-lg border border-slate-300 px-4 py-3"
                    />

                    <input
                        type="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                        minLength={8}
                        placeholder="Şifre (en az 8 karakter)"
                        className="w-full rounded-lg border border-slate-300 px-4 py-3"
                    />

                    {error && (
                        <p className="text-sm text-red-600">{error}</p>
                    )}

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full rounded-lg bg-slate-900 py-3 font-semibold text-white disabled:opacity-50"
                    >
                        {loading ? "Kayıt yapılıyor..." : "Kayıt Ol"}
                    </button>

                </form>

                <p className="mt-6 text-center text-sm text-slate-600">
                    Zaten hesabın var mı?{" "}
                    <Link to="/login" className="font-semibold text-blue-600">
                        Giriş Yap
                    </Link>
                </p>

            </div>
        </div>
    );
}

export default RegisterPage;
