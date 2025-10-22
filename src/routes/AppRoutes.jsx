import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import ProtectedRoute from "../components/ProtectedRoute";
import DashboardLayout from "../layouts/DashboardLayout";

// Páginas
import LoginPage from "../pages/LoginPage";
import Dashboard from "../pages/Dashboard";
import Empresas from "../pages/Empresas";
import Clientes from "../pages/Clientes";
import Produtos from "../pages/Produtos";
import Notas from "../pages/Notas";
import Equipamentos from "../pages/Equipamentos";
// import Usuarios from "../pages/Usuarios"; // quando criar

export default function AppRoutes() {
    const { isAuthenticated } = useAuth();

    return (
        <BrowserRouter>
            <Routes>
                {/* 🔓 Página pública */}
                <Route
                    path="/login"
                    element={
                        isAuthenticated ? <Navigate to="/" replace /> : <LoginPage />
                    }
                />

                {/* 🔒 Área protegida */}
                <Route element={<ProtectedRoute />}>
                    <Route path="/" element={<DashboardLayout />}>
                        <Route index element={<Dashboard />} />
                        <Route path="empresas" element={<Empresas />} />
                        {/* <Route path="usuarios" element={<Usuarios />} /> */}
                        <Route path="clientes" element={<Clientes />} />
                        <Route path="produtos" element={<Produtos />} />
                        <Route path="notas" element={<Notas />} />
                        <Route path="equipamentos" element={<Equipamentos />} />
                    </Route>
                </Route>

                {/* 🔁 Redirecionamentos */}
                <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
        </BrowserRouter>
    );
}
