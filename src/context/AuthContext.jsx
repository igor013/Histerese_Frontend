import { createContext, useContext, useState, useEffect } from "react";
import api from "../services/api";

console.log("🔄 AuthContext carregado");

const AuthContext = createContext();

export function AuthProvider({ children }) {
    const [user, setUser] = useState(null);
    const [token, setToken] = useState(localStorage.getItem("token") || null);
    const [empresa, setEmpresa] = useState(null);
    const [loading, setLoading] = useState(true); // usado pelo ProtectedRoute

    useEffect(() => {
        // sempre que o app iniciar, tenta restaurar a sessão
        async function restoreSession() {
            const storedToken = localStorage.getItem("token");
            if (storedToken) {
                try {
                    api.defaults.headers.common["Authorization"] = `Bearer ${storedToken}`;
                    setToken(storedToken);
                    // opcional: validar token no backend se quiser
                } catch (err) {
                    console.error("Erro ao restaurar sessão:", err);
                    logout();
                }
            }
            setLoading(false);
        }
        restoreSession();
    }, []);

    useEffect(() => {
        if (token) {
            api.defaults.headers.common["Authorization"] = `Bearer ${token}`;
        }
    }, [token]);

    async function login(login, senha, empresa_id) {
        try {
            const { data } = await api.post("/usuarios/login", { login, senha, empresa_id });

            if (data.token) {
                setUser(data.usuario);
                setToken(data.token);
                localStorage.setItem("token", data.token);
                api.defaults.headers.common["Authorization"] = `Bearer ${data.token}`;

                // Busca empresa associada
                const empresaRes = await api.get(`/empresas/${empresa_id}`);
                setEmpresa(empresaRes.data);

                return true;
            }
        } catch (err) {
            alert("Usuário ou senha inválidos.");
            console.error(err);
            return false;
        }
    }

    function logout() {
        setUser(null);
        setToken(null);
        setEmpresa(null);
        localStorage.removeItem("token");
        delete api.defaults.headers.common["Authorization"];
    }

    const isAuthenticated = !!token;

    // 👇 log para depuração
    console.log("👤 Auth state =>", {
        user,
        token,
        empresa,
        loading,
        isAuthenticated,
    });

    return (
        <AuthContext.Provider
            value={{
                user,
                token,
                empresa,
                loading,
                isAuthenticated,
                login,
                logout,
            }}
        >
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth() {
    return useContext(AuthContext);
}
