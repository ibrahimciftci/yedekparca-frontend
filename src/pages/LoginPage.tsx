
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import authService from "../services/authService";

function LoginPage() {
    const navigate = useNavigate();

    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setError("");
        setLoading(true);

        try {
            const response = await authService.login({
                email,
                password,
            });

            localStorage.setItem("token", response.data.token);

            navigate(
                response.data.user.role === "ADMIN" ? "/admin" : "/"
            );
        } catch (err: any) {
            setError(
                err.response?.data?.message ||
                "Giriş işlemi başarısız oldu."
            );
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-slate-100 px-4">
            <div className="w-full max-w-md rounded-2xl bg-white p-8 shadow-lg">

                <h1 className="text-2xl font-bold text-slate-900">
                    Hesabına Giriş Yap
                </h1>

                <p className="mt-2 text-sm text-slate-500">
                    Yedek parça platformuna hoş geldin.
                </p>

                <form onSubmit={handleLogin} className="mt-8 space-y-5">

                    <div>
                        <label className="mb-2 block text-sm font-medium">
                            E-posta
                        </label>

                        <input
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                            className="w-full rounded-lg border border-slate-300 px-4 py-3 outline-none focus:border-blue-600"
                            placeholder="ornek@email.com"
                        />
                    </div>

                    <div>
                        <label className="mb-2 block text-sm font-medium">
                            Şifre
                        </label>

                        <input
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                            className="w-full rounded-lg border border-slate-300 px-4 py-3 outline-none focus:border-blue-600"
                            placeholder="Şifrenizi girin"
                        />
                    </div>

                    {error && (
                        <p className="text-sm text-red-600">
                            {error}
                        </p>
                    )}

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full rounded-lg bg-slate-900 py-3 font-semibold text-white hover:bg-slate-800 disabled:opacity-50"
                    >
                        {loading ? "Giriş yapılıyor..." : "Giriş Yap"}
                    </button>

                </form>

                <p className="mt-6 text-center text-sm text-slate-600">
                    Hesabın yok mu?{" "}
                    <Link
                        to="/register"
                        className="font-semibold text-blue-600"
                    >
                        Kayıt Ol
                    </Link>
                </p>

            </div>
        </div>
    );
}

export default LoginPage;
