import { useEffect, useState, type ReactNode } from "react";
import { Navigate } from "react-router-dom";
import userService from "../services/userService";

function SellerRoute({ children }: { children: ReactNode }) {
    const [status, setStatus] = useState<"loading" | "seller" | "denied">("loading");

    useEffect(() => {
        let mounted = true;
        const checkSeller = async () => {
            if (!localStorage.getItem("token")) {
                if (mounted) setStatus("denied");
                return;
            }
            try {
                const response = await userService.getProfile();
                if (mounted) setStatus(response.data.data.role === "SELLER" ? "seller" : "denied");
            } catch {
                if (mounted) setStatus("denied");
            }
        };
        void checkSeller();
        return () => { mounted = false; };
    }, []);

    if (status === "loading") return <div className="flex min-h-screen items-center justify-center bg-slate-100 text-slate-600">Satıcı yetkisi kontrol ediliyor...</div>;
    if (status === "denied") return <Navigate to="/login" replace />;
    return <>{children}</>;
}

export default SellerRoute;
