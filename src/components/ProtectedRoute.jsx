import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function ProtectedRoute() {
    const { isAuthenticated, loading } = useAuth();

    console.log("🛡️ ProtectedRoute:", { loading, isAuthenticated });

    // Enquanto o AuthContext ainda estiver verificando o token
    if (loading) {
        return (
            <div className="flex items-center justify-center h-screen bg-gray-100">
                <div className="text-gray-700 text-lg font-semibold animate-pulse">
                    Verificando acesso...
                </div>
            </div>
        );
    }

    // Se não estiver autenticado, redireciona para o login
    if (!isAuthenticated) {
        return <Navigate to="/login" replace />;
    }

    // Se estiver autenticado, renderiza a rota interna
    return <Outlet />;
}
