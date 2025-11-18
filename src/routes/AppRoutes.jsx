import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import ProtectedRoute from "../components/ProtectedRoute";

// 🧱 Layout principal
import DashboardLayout from "../layouts/DashboardLayout";

// 📄 Páginas
import LoginPage from "../pages/LoginPage";
import Dashboard from "../pages/Dashboard";
import Empresas from "../pages/Empresas";
import Clientes from "../pages/Clientes";
import Produtos from "../pages/Produtos";
import Fornecedores from "../pages/Fornecedores";
import Grupos from "../pages/Grupos"; // ✅ novo módulo
import Notas from "../pages/Notas";
import Equipamentos from "../pages/Equipamentos";
import Usuarios from "../pages/Usuarios";
import Orcamentos from "../pages/Orcamentos";

export default function AppRoutes() {
    const { isAuthenticated } = useAuth();

    return (
        <BrowserRouter>
            <Routes>
                {/* 🔓 Página pública de login */}
                <Route
                    path="/login"
                    element={
                        isAuthenticated ? <Navigate to="/app" replace /> : <LoginPage />
                    }
                />

                {/* 🔒 Área protegida */}
                <Route element={<ProtectedRoute />}>
                    <Route path="/app" element={<DashboardLayout />}>
                        {/* Página inicial */}
                        <Route index element={<Dashboard />} />

                        {/* Módulos principais */}
                        <Route path="empresas" element={<Empresas />} />
                        <Route path="usuarios" element={<Usuarios />} />
                        <Route path="clientes" element={<Clientes />} />
                        <Route path="produtos" element={<Produtos />} />
                        <Route path="grupos" element={<Grupos />} /> {/* ✅ nova rota */}
                        <Route path="fornecedores" element={<Fornecedores />} />
                        <Route path="notas" element={<Notas />} />
                        <Route path="equipamentos" element={<Equipamentos />} />
                        <Route path="orcamentos" element={<Orcamentos />} />
                    </Route>
                </Route>

                {/* 🔁 Redirecionamentos */}
                <Route
                    path="/"
                    element={
                        isAuthenticated ? (
                            <Navigate to="/app" replace />
                        ) : (
                            <Navigate to="/login" replace />
                        )
                    }
                />
                <Route path="*" element={<Navigate to="/app" replace />} />
            </Routes>
        </BrowserRouter>
    );
}
