import { useEffect, useState, type ReactNode } from "react";
import { Navigate } from "react-router-dom";
import userService from "../services/userService";

interface AdminRouteProps {
    children: ReactNode;
}

function AdminRoute({ children }: AdminRouteProps) {
    const [status, setStatus] = useState<
        "loading" | "admin" | "forbidden" | "unauthenticated"
    >("loading");

    useEffect(() => {
        let isMounted = true;

        const checkAdmin = async () => {
            if (!localStorage.getItem("token")) {
                if (isMounted) setStatus("unauthenticated");
                return;
            }

            try {
                const response = await userService.getProfile();

                if (isMounted) {
                    setStatus(
                        response.data.data.role === "ADMIN"
                            ? "admin"
                            : "forbidden"
                    );
                }
            } catch {
                if (isMounted) setStatus("unauthenticated");
            }
        };

        checkAdmin();

        return () => {
            isMounted = false;
        };
    }, []);

    if (status === "loading") {
        return (
            <div className="flex min-h-screen items-center justify-center bg-slate-100">
                <p className="text-slate-600">Yetki kontrolü yapılıyor...</p>
            </div>
        );
    }

    if (status === "unauthenticated") {
        return <Navigate to="/login" replace />;
    }

    if (status === "forbidden") {
        return <Navigate to="/" replace />;
    }

    return <>{children}</>;
}

export default AdminRoute;