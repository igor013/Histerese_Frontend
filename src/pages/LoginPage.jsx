import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import axios from "axios";

export default function LoginPage() {
    const [login, setLogin] = useState("");
    const [senha, setSenha] = useState("");
    const [empresaId, setEmpresaId] = useState("");
    const [empresas, setEmpresas] = useState([]);
    const [logoUrl, setLogoUrl] = useState(null);
    const [empresaNome, setEmpresaNome] = useState("Histerese ERP");
    const { login: handleLogin } = useAuth();
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);

    // 🔁 Buscar todas as empresas públicas
    useEffect(() => {
        async function fetchEmpresas() {
            try {
                const res = await axios.get("http://localhost:4000/api/public/empresas");
                const lista = res.data || [];
                setEmpresas(lista);

                if (lista.length > 0) {
                    const primeira = lista[0];
                    setEmpresaId(primeira.id);
                    setEmpresaNome(primeira.nome_fantasia || primeira.razao_social);
                    setLogoUrl(primeira.logo_url);
                }
            } catch (err) {
                console.error("⚠️ Erro ao carregar empresas públicas:", err.message);
            }
        }
        fetchEmpresas();
    }, []);

    // 🧭 Atualiza logo e nome ao mudar empresa
    useEffect(() => {
        const empresaSelecionada = empresas.find(
            (e) => e.id === parseInt(empresaId)
        );
        if (empresaSelecionada) {
            setEmpresaNome(
                empresaSelecionada.nome_fantasia || empresaSelecionada.razao_social
            );
            setLogoUrl(empresaSelecionada.logo_url);
        }
    }, [empresaId, empresas]);

    // 🔐 Submeter login
    async function onSubmit(e) {
        e.preventDefault();
        setLoading(true);

        const success = await handleLogin(login.toUpperCase(), senha, empresaId);
        setLoading(false);
        if (success) navigate("/");
    }

    // 🖼️ Fallback seguro para logo
    const logoSegura =
        logoUrl && logoUrl.startsWith("http")
            ? logoUrl
            : "http://localhost:4000/uploads/logos/logo_empresa.jpg";

    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 via-blue-900 to-slate-800">
            <div className="bg-white/10 backdrop-blur-md p-10 rounded-2xl shadow-2xl w-full max-w-md border border-white/20 text-center transition-all duration-300">

                {/* LOGO E NOME DA EMPRESA */}
                <div className="flex flex-col items-center mb-6">
                    <div className="w-24 h-24 mb-3 rounded-full bg-white/10 flex items-center justify-center border border-white/30 shadow-md overflow-hidden">
                        <img
                            src={logoSegura}
                            alt="Logo da empresa"
                            className="w-full h-full object-contain"
                        />
                    </div>
                    <h1 className="text-2xl font-bold text-white tracking-wide">
                        {empresaNome || "Histerese ERP"}
                    </h1>
                    <p className="text-gray-300 text-sm mt-1">
                        Acesse sua conta para continuar
                    </p>
                </div>

                {/* FORMULÁRIO */}
                <form onSubmit={onSubmit} className="space-y-4 text-left">
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

                    {/* SELETOR DE EMPRESAS */}
                    <div>
                        <label className="block text-gray-200 mb-1 text-sm">Empresa</label>
                        <select
                            value={empresaId}
                            onChange={(e) => setEmpresaId(e.target.value)}
                            className="w-full p-2 rounded-md bg-white/20 text-white border border-white/30 focus:outline-none focus:ring-2 focus:ring-blue-500"
                            required
                        >
                            {empresas.length === 0 ? (
                                <option value="">Nenhuma empresa encontrada</option>
                            ) : (
                                empresas.map((e) => (
                                    <option
                                        key={e.id}
                                        value={e.id}
                                        className="bg-slate-900 text-white"
                                    >
                                        {`${e.id} - ${e.nome_fantasia || e.razao_social}`}
                                    </option>
                                ))
                            )}
                        </select>
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full py-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-md mt-4 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {loading ? "Entrando..." : "Entrar"}
                    </button>
                </form>

                {/* RODAPÉ */}
                <p className="text-gray-400 text-xs text-center mt-6">
                    © {new Date().getFullYear()} Histerese ERP — Todos os direitos reservados.
                </p>
            </div>
        </div>
    );
}
