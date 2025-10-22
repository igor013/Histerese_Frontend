import { createContext, useContext, useState, useEffect } from "react";
import api from "../services/api";

const AuthContext = createContext();

export function AuthProvider({ children }) {
    const [user, setUser] = useState(null);
    const [token, setToken] = useState(localStorage.getItem("token") || null);
    const [empresa, setEmpresa] = useState(null);

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

                // Buscar empresa (logo, nome, etc.)
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

    return (
        <AuthContext.Provider value={{ user, token, empresa, login, logout }}>
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth() {
    return useContext(AuthContext);
}
