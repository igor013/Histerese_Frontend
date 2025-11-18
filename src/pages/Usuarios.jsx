import { useEffect, useState, useRef } from "react";
import {
    FaSearch,
    FaEdit,
    FaTrashAlt,
    FaSave,
    FaPlus,
    FaTimes,
} from "react-icons/fa";
import { useAuth } from "../context/AuthContext";
import {
    listarUsuarios,
    criarUsuario,
    atualizarUsuario,
    atualizarSenha,
    excluirUsuario,
    loginUsuario,
} from "../services/usuarioService";

export default function Usuarios() {
    const [usuarios, setUsuarios] = useState([]);
    const [filtro, setFiltro] = useState("");
    const [selecionado, setSelecionado] = useState(null);
    const [modo, setModo] = useState(null); // "novo" | "editar"
    const [formData, setFormData] = useState({
        nome: "",
        login: "",
        senha: "",
        senhaAtual: "",
        novaSenha: "",
    });
    const [formInicial, setFormInicial] = useState(null);
    const [loading, setLoading] = useState(false);
    const [confirmarExclusao, setConfirmarExclusao] = useState(false);
    const [senhaErrada, setSenhaErrada] = useState(false);
    const excluirBtnRef = useRef(null);

    const { logout, user } = useAuth();

    // ==================================================
    // 🔄 Carregar usuários
    // ==================================================
    const carregar = async () => {
        try {
            const data = await listarUsuarios(filtro);
            setUsuarios(data);
        } catch (err) {
            console.error("Erro ao carregar usuários:", err);
        }
    };

    useEffect(() => {
        carregar();
    }, []);

    // ==================================================
    // ➕ Abrir card de cadastro
    // ==================================================
    const abrirCadastro = () => {
        const base = { nome: "", login: "", senha: "", senhaAtual: "", novaSenha: "" };
        setModo("novo");
        setFormData(base);
        setFormInicial(base);
        setConfirmarExclusao(false);
        setSenhaErrada(false);
    };

    // ==================================================
    // ✏️ Abrir card de edição
    // ==================================================
    const abrirEdicao = () => {
        if (!selecionado) return;
        const base = {
            nome: selecionado.nome,
            login: selecionado.login,
            senha: "",
            senhaAtual: "",
            novaSenha: "",
        };
        setModo("editar");
        setFormData(base);
        setFormInicial(base);
        setConfirmarExclusao(false);
        setSenhaErrada(false);
    };

    // ==================================================
    // 💾 Salvar (novo/editar)
    // ==================================================
    const salvar = async () => {
        if (confirmarExclusao) return;
        try {
            setLoading(true);

            // === NOVO USUÁRIO ===
            if (modo === "novo") {
                await criarUsuario({
                    nome: formData.nome.trim(),
                    login: formData.login.trim().toUpperCase(),
                    senha: formData.senha,
                    empresa_id: user?.empresa_id,
                });
            }

            // === EDITAR USUÁRIO EXISTENTE ===
            else if (modo === "editar" && selecionado) {
                // Atualiza dados básicos
                await atualizarUsuario(selecionado.id, {
                    nome: formData.nome,
                    login: formData.login.toUpperCase(),
                });

                // Detectar se o próprio usuário alterou nome ou login
                const alterouLogin =
                    user && selecionado.id === user.id && formData.login !== user.login;
                const alterouNome =
                    user && selecionado.id === user.id && formData.nome !== user.nome;

                // Atualizar senha se preenchido
                if (formData.novaSenha && formData.senhaAtual) {
                    if (senhaErrada) {
                        alert("Senha atual incorreta.");
                        setLoading(false);
                        return;
                    }

                    await atualizarSenha(selecionado.id, formData.senhaAtual, formData.novaSenha);

                    // Logout obrigatório se alterou a própria senha
                    if (user && selecionado.id === user.id) {
                        alert("Sua senha foi alterada. Faça login novamente.");
                        logout();
                        return;
                    }
                }

                // Logout se alterou o próprio login ou nome
                if (alterouLogin || alterouNome) {
                    alert("Seu login foi alterado. Faça login novamente.");
                    logout();
                    return;
                }
            }

            fecharCard();
            carregar();
        } catch (err) {
            alert(err.response?.data?.erro || "Erro ao salvar usuário.");
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    // ==================================================
    // 🗑️ Excluir usuário
    // ==================================================
    const excluir = async () => {
        if (!selecionado) return;
        try {
            await excluirUsuario(selecionado.id);

            // Se excluir o próprio usuário → forçar logout
            if (user && selecionado.id === user.id) {
                logout();
                return;
            }

            setConfirmarExclusao(false);
            fecharCard();
            carregar();
        } catch (err) {
            alert("Erro ao excluir usuário.");
            console.error(err);
        }
    };

    // ==================================================
    // 🔐 Validar senha atual
    // ==================================================
    const validarSenhaAtual = async () => {
        if (!formData.senhaAtual || !selecionado) return;
        try {
            await loginUsuario({
                login: selecionado.login.toUpperCase(),
                senha: formData.senhaAtual,
                empresa_id: user?.empresa_id,
            });
            setSenhaErrada(false);
        } catch {
            setSenhaErrada(true);
        }
    };

    // ==================================================
    // ❌ Fechar card
    // ==================================================
    const fecharCard = () => {
        setModo(null);
        setFormData({
            nome: "",
            login: "",
            senha: "",
            senhaAtual: "",
            novaSenha: "",
        });
        setSelecionado(null);
        setConfirmarExclusao(false);
        setSenhaErrada(false);
    };

    // 🧠 Detectar se houve alterações
    const houveAlteracao = JSON.stringify(formData) !== JSON.stringify(formInicial);

    // ==================================================
    // 🧩 Renderização
    // ==================================================
    return (
        <div className="p-6">
            <h2 className="text-2xl font-semibold mb-4 text-gray-700">
                Gerenciamento de Usuários
            </h2>

            {/* 🔎 Filtro e botões superiores */}
            <div className="flex gap-2 mb-6">
                <input
                    placeholder="Filtrar por ID, nome ou login"
                    value={filtro}
                    onChange={(e) => setFiltro(e.target.value)}
                    className="border rounded px-3 py-1.5 w-64"
                />
                <button
                    onClick={carregar}
                    className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-1.5 rounded flex items-center gap-2"
                >
                    <FaSearch /> Buscar
                </button>

                <button
                    onClick={abrirCadastro}
                    className="bg-green-600 hover:bg-green-700 text-white px-3 py-1.5 rounded flex items-center gap-2 ml-auto"
                >
                    <FaPlus /> Cadastrar
                </button>

                <button
                    onClick={abrirEdicao}
                    disabled={!selecionado}
                    className={`px-3 py-1.5 rounded flex items-center gap-2 ${selecionado
                            ? "bg-blue-600 hover:bg-blue-700 text-white"
                            : "bg-gray-300 text-gray-500 cursor-not-allowed"
                        }`}
                >
                    <FaEdit /> Editar
                </button>
            </div>

            {/* 📋 Tabela */}
            <table className="w-full bg-white shadow rounded overflow-hidden mb-4">
                <thead className="bg-gray-100 border-b">
                    <tr>
                        <th className="py-3 px-4 text-left">ID</th>
                        <th className="py-3 px-4 text-left">Nome</th>
                        <th className="py-3 px-4 text-left">Login</th>
                    </tr>
                </thead>
                <tbody>
                    {usuarios.map((u) => (
                        <tr
                            key={u.id}
                            onClick={() => setSelecionado(u)}
                            className={`cursor-pointer border-b hover:bg-gray-100 ${selecionado?.id === u.id ? "bg-blue-50" : ""
                                }`}
                        >
                            <td className="py-2 px-4">{u.id}</td>
                            <td className="py-2 px-4">{u.nome}</td>
                            <td className="py-2 px-4">{u.login}</td>
                        </tr>
                    ))}
                </tbody>
            </table>

            {/* 🧩 Card de cadastro/edição */}
            {modo && (
                <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
                    <div className="bg-white rounded-xl shadow-2xl p-6 w-full max-w-md relative">
                        {/* Fechar */}
                        <button
                            onClick={fecharCard}
                            className="absolute top-3 right-3 text-gray-500 hover:text-gray-700"
                        >
                            <FaTimes size={18} />
                        </button>

                        <h3 className="text-xl font-semibold mb-2 text-gray-700 text-center">
                            {modo === "novo" ? "Cadastrar Novo Usuário" : "Editar Usuário"}
                        </h3>

                        {/* Botão excluir */}
                        {modo === "editar" && (
                            <div className="flex justify-end mb-4">
                                <button
                                    ref={excluirBtnRef}
                                    type="button"
                                    onClick={() => setConfirmarExclusao((v) => !v)}
                                    className="flex items-center gap-2 text-gray-500 hover:text-red-600 transition-colors text-sm font-medium"
                                >
                                    <FaTrashAlt size={14} /> Excluir
                                </button>
                                {confirmarExclusao && (
                                    <div className="bg-white border border-gray-200 rounded-lg shadow-xl p-3 w-64 absolute right-6 mt-8 z-50">
                                        <p className="text-sm text-gray-700 mb-3">
                                            Deseja realmente excluir este usuário?
                                        </p>
                                        <div className="flex justify-end gap-2">
                                            <button
                                                type="button"
                                                onClick={() => setConfirmarExclusao(false)}
                                                className="px-3 py-1.5 rounded bg-gray-200 hover:bg-gray-300 text-gray-700 text-sm"
                                            >
                                                Cancelar
                                            </button>
                                            <button
                                                type="button"
                                                onClick={excluir}
                                                className="px-3 py-1.5 rounded bg-red-700 hover:bg-red-800 text-white text-sm"
                                            >
                                                Excluir
                                            </button>
                                        </div>
                                    </div>
                                )}
                            </div>
                        )}

                        {/* Formulário */}
                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm text-gray-600 mb-1">Nome</label>
                                <input
                                    value={formData.nome}
                                    onChange={(e) =>
                                        setFormData({ ...formData, nome: e.target.value })
                                    }
                                    className="border rounded px-3 py-1.5 w-full"
                                    placeholder="Nome completo"
                                />
                            </div>

                            <div>
                                <label className="block text-sm text-gray-600 mb-1">Login</label>
                                <input
                                    value={formData.login}
                                    onChange={(e) =>
                                        setFormData({
                                            ...formData,
                                            login: e.target.value.toUpperCase(),
                                        })
                                    }
                                    className="border rounded px-3 py-1.5 w-full uppercase"
                                    placeholder="LOGIN"
                                />
                            </div>

                            {modo === "novo" ? (
                                <div>
                                    <label className="block text-sm text-gray-600 mb-1">Senha</label>
                                    <input
                                        type="password"
                                        value={formData.senha}
                                        onChange={(e) =>
                                            setFormData({ ...formData, senha: e.target.value })
                                        }
                                        className="border rounded px-3 py-1.5 w-full"
                                        placeholder="••••••••"
                                    />
                                </div>
                            ) : (
                                <div className="grid grid-cols-2 gap-3">
                                    <div>
                                        <label className="block text-sm text-gray-600 mb-1">
                                            Senha Atual
                                        </label>
                                        <input
                                            type="password"
                                            value={formData.senhaAtual}
                                            onChange={(e) =>
                                                setFormData({ ...formData, senhaAtual: e.target.value })
                                            }
                                            onBlur={validarSenhaAtual}
                                            className={`border rounded px-3 py-1.5 w-full ${senhaErrada ? "border-red-500" : ""
                                                }`}
                                            placeholder="Senha atual"
                                        />
                                        {senhaErrada && (
                                            <p className="text-red-500 text-xs mt-1">
                                                Senha atual incorreta
                                            </p>
                                        )}
                                    </div>
                                    <div>
                                        <label className="block text-sm text-gray-600 mb-1">
                                            Nova Senha
                                        </label>
                                        <input
                                            type="password"
                                            value={formData.novaSenha}
                                            onChange={(e) =>
                                                setFormData({ ...formData, novaSenha: e.target.value })
                                            }
                                            className="border rounded px-3 py-1.5 w-full"
                                            placeholder="Nova senha"
                                        />
                                    </div>
                                </div>
                            )}

                            {/* Botões internos */}
                            <div className="flex justify-end gap-3 mt-6">
                                <button
                                    type="button"
                                    onClick={salvar}
                                    disabled={!houveAlteracao || loading}
                                    className={`px-3 py-1.5 rounded flex items-center gap-2 ${houveAlteracao
                                            ? "bg-green-600 hover:bg-green-700 text-white"
                                            : "bg-gray-300 text-gray-500 cursor-not-allowed"
                                        }`}
                                >
                                    <FaSave /> {loading ? "Salvando..." : "Salvar"}
                                </button>
                                <button
                                    type="button"
                                    onClick={fecharCard}
                                    className="px-3 py-1.5 rounded bg-gray-300 hover:bg-gray-400 text-gray-700 flex items-center gap-2"
                                >
                                    <FaTimes /> Cancelar
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
