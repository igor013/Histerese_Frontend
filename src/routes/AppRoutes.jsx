import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { AuthProvider } from "../context/AuthContext";
import PrivateRoute from "./PrivateRoute";
import LoginPage from "../pages/LoginPage";
import Dashboard from "../pages/Dashboard";
import Empresas from "../pages/Empresas";
import Clientes from "../pages/Clientes";
import Produtos from "../pages/Produtos";
import Notas from "../pages/Notas";
import Equipamentos from "../pages/Equipamentos";

export default function AppRoutes() {
    return (
        <AuthProvider>
            <Router>
                <Routes>
                    <Route path="/login" element={<LoginPage />} />

                    {/* Rotas protegidas */}
                    <Route path="/" element={<PrivateRoute><Dashboard /></PrivateRoute>} />
                    <Route path="/empresas" element={<PrivateRoute><Empresas /></PrivateRoute>} />
                    <Route path="/clientes" element={<PrivateRoute><Clientes /></PrivateRoute>} />
                    <Route path="/produtos" element={<PrivateRoute><Produtos /></PrivateRoute>} />
                    <Route path="/notas" element={<PrivateRoute><Notas /></PrivateRoute>} />
                    <Route path="/equipamentos" element={<PrivateRoute><Equipamentos /></PrivateRoute>} />
                </Routes>
            </Router>
        </AuthProvider>
    );
}
