import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function LoginPage() {
    const [login, setLogin] = useState("");
    const [senha, setSenha] = useState("");
    const [empresa_id, setEmpresaId] = useState("1");
    const { login: handleLogin, empresa } = useAuth(); // ✅ agora empresa está definida
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);

    async function onSubmit(e) {
        e.preventDefault();
        setLoading(true);
        const success = await handleLogin(login.toUpperCase(), senha, empresa_id);
        setLoading(false);
        if (success) navigate("/");
    }

    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-900 via-blue-900 to-gray-800">
            <div className="bg-white/10 backdrop-blur-md p-10 rounded-2xl shadow-xl w-full max-w-md border border-white/20">
                {/* LOGO */}
                <div className="flex flex-col items-center mb-6">
                    <img
                        src={empresa?.logo_url || "/logo.png"} // ✅ busca logo real do backend
                        alt="Logo Histerese ERP"
                        className="w-20 h-20 mb-3 rounded-full bg-white/20 p-2 object-contain"
                    />
                    <h1 className="text-2xl font-bold text-white tracking-wide">
                        Histerese ERP
                    </h1>
                    <p className="text-gray-300 text-sm mt-1">
                        Acesse sua conta para continuar
                    </p>
                </div>

                {/* FORMULÁRIO */}
                <form onSubmit={onSubmit} className="space-y-4">
                    <div>
                        <label className="block text-gray-200 mb-1 text-sm">Login</label>
                        <input
                            type="text"
                            placeholder="Digite seu login"
                            value={login}
                            onChange={(e) => setLogin(e.target.value)}
                            className="w-full p-2 rounded-md bg-white/20 text-white placeholder-gray-300 border border-white/30 focus:outline-none focus:ring-2 focus:ring-blue-500"
                            required
                        />
                    </div>

                    <div>
                        <label className="block text-gray-200 mb-1 text-sm">Senha</label>
                        <input
                            type="password"
                            placeholder="Digite sua senha"
                            value={senha}
                            onChange={(e) => setSenha(e.target.value)}
                            className="w-full p-2 rounded-md bg-white/20 text-white placeholder-gray-300 border border-white/30 focus:outline-none focus:ring-2 focus:ring-blue-500"
                            required
                        />
                    </div>

                    <div>
                        <label className="block text-gray-200 mb-1 text-sm">Empresa ID</label>
                        <input
                            type="number"
                            value={empresa_id}
                            onChange={(e) => setEmpresaId(e.target.value)}
                            className="w-full p-2 rounded-md bg-white/20 text-white placeholder-gray-300 border border-white/30 focus:outline-none focus:ring-2 focus:ring-blue-500"
                            required
                        />
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full py-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-md mt-4 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {loading ? "Entrando..." : "Entrar"}
                    </button>
                </form>

                {/* Rodapé */}
                <p className="text-gray-400 text-xs text-center mt-6">
                    © {new Date().getFullYear()} Histerese ERP — Todos os direitos reservados.
                </p>
            </div>
        </div>
    );
}

