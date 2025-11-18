import { createContext, useContext, useState, useEffect } from "react";
import api from "../services/api";

console.log("🔄 AuthContext carregado");

// ✅ Exporta o contexto para ser usado no Header e em outros componentes
export const AuthContext = createContext();

export function AuthProvider({ children }) {
    const [user, setUser] = useState(null);
    const [token, setToken] = useState(localStorage.getItem("token") || null);
    const [empresa, setEmpresa] = useState(null);
    const [loading, setLoading] = useState(true); // usado pelo ProtectedRoute

    // 🔁 Restaura sessão ao iniciar o app
    useEffect(() => {
        async function restoreSession() {
            const storedToken = localStorage.getItem("token");
            if (storedToken) {
                try {
                    api.defaults.headers.common["Authorization"] = `Bearer ${storedToken}`;
                    setToken(storedToken);
                    // (opcional) validar token no backend
                } catch (err) {
                    console.error("Erro ao restaurar sessão:", err);
                    logout();
                }
            }
            setLoading(false);
        }
        restoreSession();
    }, []);

    // 🔐 Sempre que o token mudar, aplica no axios
    useEffect(() => {
        if (token) {
            api.defaults.headers.common["Authorization"] = `Bearer ${token}`;
        } else {
            delete api.defaults.headers.common["Authorization"];
        }
    }, [token]);

    // 🔓 Login
    async function login(login, senha, empresa_id) {
        try {
            const { data } = await api.post("/usuarios/login", { login, senha, empresa_id });

            if (data.token) {
                setUser(data.usuario);
                setToken(data.token);
                localStorage.setItem("token", data.token);
                api.defaults.headers.common["Authorization"] = `Bearer ${data.token}`;

                // busca a empresa associada
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

    // 🚪 Logout
    function logout() {
        setUser(null);
        setToken(null);
        setEmpresa(null);
        localStorage.removeItem("token");
        delete api.defaults.headers.common["Authorization"];
    }

    const isAuthenticated = !!token;

    // 👀 Log de depuração (aparece no console)
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

// ✅ Hook personalizado para usar o contexto facilmente
export function useAuth() {
    return useContext(AuthContext);
}
