import { useEffect, useState, useRef } from "react";
import {
    FaSearch,
    FaEdit,
    FaTrashAlt,
    FaSave,
    FaTimes,
} from "react-icons/fa";
import {
    listarEmpresas,
    atualizarEmpresa,
    excluirEmpresa,
} from "../services/empresaService";

export default function Empresas() {
    const [empresas, setEmpresas] = useState([]);
    const [filtro, setFiltro] = useState("");
    const [selecionado, setSelecionado] = useState(null);
    const [modo, setModo] = useState(null); // "editar"
    const [formData, setFormData] = useState({
        razao_social: "",
        nome_fantasia: "",
        cnpj: "",
        email: "",
        telefone: "",
        cidade: "",
        uf: "",
    });
    const [formInicial, setFormInicial] = useState(null);
    const [loading, setLoading] = useState(false);
    const [confirmarExclusao, setConfirmarExclusao] = useState(false);
    const excluirBtnRef = useRef(null);

    // ==================================================
    // 🔄 Carregar empresas
    // ==================================================
    const carregar = async () => {
        try {
            const data = await listarEmpresas(filtro);
            setEmpresas(data);
        } catch (err) {
            console.error("Erro ao carregar empresas:", err);
        }
    };

    useEffect(() => {
        carregar();
    }, []);

    // ==================================================
    // ✏️ Abrir card de edição
    // ==================================================
    const abrirEdicao = () => {
        if (!selecionado) return;
        const base = {
            razao_social: selecionado.razao_social,
            nome_fantasia: selecionado.nome_fantasia,
            cnpj: selecionado.cnpj,
            email: selecionado.email,
            telefone: selecionado.telefone,
            cidade: selecionado.cidade,
            uf: selecionado.uf,
        };
        setModo("editar");
        setFormData(base);
        setFormInicial(base);
        setConfirmarExclusao(false);
    };

    // ==================================================
    // 💾 Salvar alterações
    // ==================================================
    const salvar = async () => {
        if (!selecionado) return;
        try {
            setLoading(true);
            await atualizarEmpresa(selecionado.id, formData);
            fecharCard();
            carregar();
        } catch (err) {
            alert(err.response?.data?.erro || "Erro ao salvar empresa.");
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    // ==================================================
    // 🗑️ Excluir empresa
    // ==================================================
    const excluir = async () => {
        if (!selecionado) return;
        try {
            await excluirEmpresa(selecionado.id);
            setConfirmarExclusao(false);
            fecharCard();
            carregar();
        } catch (err) {
            alert("Erro ao excluir empresa.");
            console.error(err);
        }
    };

    // ==================================================
    // ❌ Fechar card
    // ==================================================
    const fecharCard = () => {
        setModo(null);
        setFormData({
            razao_social: "",
            nome_fantasia: "",
            cnpj: "",
            email: "",
            telefone: "",
            cidade: "",
            uf: "",
        });
        setSelecionado(null);
        setConfirmarExclusao(false);
    };

    // 🧠 Detectar se houve alterações
    const houveAlteracao = JSON.stringify(formData) !== JSON.stringify(formInicial);

    // ==================================================
    // 🧩 Renderização
    // ==================================================
    return (
        <div className="p-6">
            <h2 className="text-2xl font-semibold mb-4 text-gray-700">
                Gerenciamento de Empresas
            </h2>

            {/* 🔎 Filtro e botões superiores */}
            <div className="flex gap-2 mb-6">
                <input
                    placeholder="Filtrar por ID, razão social ou nome fantasia"
                    value={filtro}
                    onChange={(e) => setFiltro(e.target.value)}
                    className="border rounded px-3 py-1.5 w-72"
                />
                <button
                    onClick={carregar}
                    className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-1.5 rounded flex items-center gap-2"
                >
                    <FaSearch /> Buscar
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
                        <th className="py-3 px-4 text-left">Nome Fantasia</th>
                        <th className="py-3 px-4 text-left">Razão Social</th>
                        <th className="py-3 px-4 text-left">CNPJ</th>
                    </tr>
                </thead>
                <tbody>
                    {empresas.map((e) => (
                        <tr
                            key={e.id}
                            onClick={() => setSelecionado(e)}
                            className={`cursor-pointer border-b hover:bg-gray-100 ${selecionado?.id === e.id ? "bg-blue-50" : ""
                                }`}
                        >
                            <td className="py-2 px-4">{e.id}</td>
                            <td className="py-2 px-4">{e.nome_fantasia}</td>
                            <td className="py-2 px-4">{e.razao_social}</td>
                            <td className="py-2 px-4">{e.cnpj}</td>
                        </tr>
                    ))}
                </tbody>
            </table>

            {/* 🧩 Card de edição */}
            {modo === "editar" && (
                <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
                    <div className="bg-white rounded-xl shadow-2xl p-6 w-full max-w-md relative">
                        <button
                            onClick={fecharCard}
                            className="absolute top-3 right-3 text-gray-500 hover:text-gray-700"
                        >
                            <FaTimes size={18} />
                        </button>

                        <h3 className="text-xl font-semibold mb-4 text-gray-700 text-center">
                            Editar Empresa
                        </h3>

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
                                        Deseja realmente excluir esta empresa?
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

                        {/* Formulário */}
                        <div className="space-y-3">
                            {["razao_social", "nome_fantasia", "cnpj", "email", "telefone", "cidade", "uf"].map((campo) => (
                                <div key={campo}>
                                    <label className="block text-sm text-gray-600 mb-1 capitalize">
                                        {campo.replace("_", " ")}
                                    </label>
                                    <input
                                        value={formData[campo] || ""}
                                        onChange={(e) =>
                                            setFormData({ ...formData, [campo]: e.target.value })
                                        }
                                        className="border rounded px-3 py-1.5 w-full"
                                        placeholder={campo.replace("_", " ")}
                                    />
                                </div>
                            ))}

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
