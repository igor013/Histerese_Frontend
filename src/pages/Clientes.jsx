// src/pages/Clientes.jsx
import { useEffect, useState, useRef } from "react";
import {
    FaSearch,
    FaEdit,
    FaTrashAlt,
    FaSave,
    FaPlus,
    FaTimes,
} from "react-icons/fa";
import clienteService from "../services/clienteService";

export default function Clientes() {
    const [clientes, setClientes] = useState([]);
    const [filtro, setFiltro] = useState("");
    const [selecionado, setSelecionado] = useState(null);
    const [modo, setModo] = useState(null);
    const [formData, setFormData] = useState({
        nome: "",
        empresa: "",
        telefone: "",
        cidade: "",
        tipo_pessoa: "F",
        cpf_cnpj: "",
        rua: "",
        bairro: "",
        numero: "",
        complemento: "",
    });
    const [formInicial, setFormInicial] = useState(null);
    const [loading, setLoading] = useState(false);
    const [confirmarExclusao, setConfirmarExclusao] = useState(false);
    const excluirBtnRef = useRef(null);

    // ==================================================
    // 🔄 Carregar clientes (ordenado por nome)
    // ==================================================
    const carregar = async () => {
        try {
            const data = await clienteService.listar(1, filtro);
            const lista = data.items || data || [];
            const ordenada = lista.sort((a, b) =>
                a.nome?.localeCompare(b.nome, "pt-BR", { sensitivity: "base" })
            );
            setClientes(ordenada);
        } catch (err) {
            console.error("Erro ao carregar clientes:", err);
        }
    };

    useEffect(() => {
        carregar();
    }, []);

    // ==================================================
    // ➕ Novo cliente
    // ==================================================
    const abrirCadastro = () => {
        const base = {
            nome: "",
            empresa: "",
            telefone: "",
            cidade: "",
            tipo_pessoa: "F",
            cpf_cnpj: "",
            rua: "",
            bairro: "",
            numero: "",
            complemento: "",
        };
        setModo("novo");
        setFormData(base);
        setFormInicial(base);
        setConfirmarExclusao(false);
    };

    // ==================================================
    // ✏️ Editar cliente
    // ==================================================
    const abrirEdicao = () => {
        if (!selecionado) return;
        const base = {
            nome: selecionado.nome || "",
            empresa: selecionado.empresa || "",
            telefone: selecionado.telefone || "",
            cidade: selecionado.cidade || "",
            tipo_pessoa: selecionado.tipo_pessoa || "F",
            cpf_cnpj: selecionado.cpf_cnpj || "",
            rua: selecionado.rua || "",
            bairro: selecionado.bairro || "",
            numero: selecionado.numero || "",
            complemento: selecionado.complemento || "",
        };
        setModo("editar");
        setFormData(base);
        setFormInicial(base);
        setConfirmarExclusao(false);
    };

    // ==================================================
    // 💾 Salvar cliente
    // ==================================================
    const salvar = async () => {
        if (confirmarExclusao) return;
        try {
            setLoading(true);
            if (modo === "novo") {
                await clienteService.criar(formData);
            } else if (modo === "editar" && selecionado) {
                await clienteService.atualizar(selecionado.id, formData);
            }
            fecharCard();
            carregar();
        } catch (err) {
            alert(err.response?.data?.erro || "Erro ao salvar cliente.");
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    // ==================================================
    // 🗑️ Excluir cliente
    // ==================================================
    const excluir = async () => {
        if (!selecionado) return;
        try {
            await clienteService.excluir(selecionado.id);
            setConfirmarExclusao(false);
            fecharCard();
            carregar();
        } catch (err) {
            alert("Erro ao excluir cliente.");
            console.error(err);
        }
    };

    // ==================================================
    // ❌ Fechar card
    // ==================================================
    const fecharCard = () => {
        setModo(null);
        setFormData({
            nome: "",
            empresa: "",
            telefone: "",
            cidade: "",
            tipo_pessoa: "F",
            cpf_cnpj: "",
            rua: "",
            bairro: "",
            numero: "",
            complemento: "",
        });
        setSelecionado(null);
        setConfirmarExclusao(false);
    };

    const houveAlteracao = JSON.stringify(formData) !== JSON.stringify(formInicial);

    // ==================================================
    // 🧩 Renderização
    // ==================================================
    return (
        <div className="p-0">
            <h2 className="text-2xl font-semibold mb-4 text-gray-700">
                Cadastro de Clientes
            </h2>

            {/* Filtro e botões */}
            <div className="flex gap-2 mb-6">
                <input
                    placeholder="Filtrar por nome ou empresa"
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
                    onClick={abrirCadastro}
                    className="bg-green-600 hover:bg-green-700 text-white px-3 py-1.5 rounded flex items-center gap-2 ml-auto"
                >
                    <FaPlus /> Novo Cliente
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

            {/* Tabela */}
            <table className="w-full bg-white shadow rounded overflow-hidden mb-4">
                <thead className="bg-gray-100 border-b">
                    <tr>
                        <th className="py-3 px-4 text-left w-20">ID</th>
                        <th className="py-3 px-4 text-left">Nome</th>
                        <th className="py-3 px-4 text-left">Empresa</th>
                        <th className="py-3 px-4 text-left">Telefone</th>
                        <th className="py-3 px-4 text-left">Cidade</th>
                        <th className="py-3 px-4 text-left">Status</th>
                    </tr>
                </thead>
                <tbody>
                    {clientes.map((c) => (
                        <tr
                            key={c.id}
                            onClick={() => setSelecionado(c)}
                            className={`cursor-pointer border-b hover:bg-gray-100 ${selecionado?.id === c.id ? "bg-blue-50" : ""
                                }`}
                        >
                            <td className="py-2 px-4">{c.id}</td>
                            <td className="py-2 px-4">{c.nome}</td>
                            <td className="py-2 px-4">{c.empresa}</td>
                            <td className="py-2 px-4">{c.telefone}</td>
                            <td className="py-2 px-4">{c.cidade}</td>
                            <td className="py-2 px-4 capitalize">{c.status}</td>
                        </tr>
                    ))}
                </tbody>
            </table>

            {/* Modal */}
            {modo && (
                <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
                    <div className="bg-white rounded-xl shadow-2xl p-8 w-[850px] max-h-[90vh] overflow-y-auto relative transition-all duration-300">
                        <button
                            onClick={fecharCard}
                            className="absolute top-3 right-3 text-gray-500 hover:text-gray-700"
                        >
                            <FaTimes size={18} />
                        </button>

                        <h3 className="text-xl font-semibold mb-5 text-gray-700 text-center">
                            {modo === "novo" ? "Cadastrar Novo Cliente" : "Editar Cliente"}
                        </h3>

                        {/* Botão Excluir */}
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
                                            Deseja realmente excluir este cliente?
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
                        <div className="grid grid-cols-2 gap-4">
                            <input
                                value={formData.nome}
                                onChange={(e) => setFormData({ ...formData, nome: e.target.value })}
                                className="border rounded px-3 py-2 col-span-2"
                                placeholder="Nome completo"
                            />
                            <input
                                value={formData.empresa}
                                onChange={(e) => setFormData({ ...formData, empresa: e.target.value })}
                                className="border rounded px-3 py-2 col-span-2"
                                placeholder="Empresa"
                            />
                            <input
                                value={formData.telefone}
                                onChange={(e) => setFormData({ ...formData, telefone: e.target.value })}
                                className="border rounded px-3 py-2"
                                placeholder="Telefone"
                            />
                            <input
                                value={formData.cidade}
                                onChange={(e) => setFormData({ ...formData, cidade: e.target.value })}
                                className="border rounded px-3 py-2"
                                placeholder="Cidade"
                            />
                            <input
                                value={formData.rua}
                                onChange={(e) => setFormData({ ...formData, rua: e.target.value })}
                                className="border rounded px-3 py-2 col-span-2"
                                placeholder="Rua"
                            />
                            <input
                                value={formData.bairro}
                                onChange={(e) => setFormData({ ...formData, bairro: e.target.value })}
                                className="border rounded px-3 py-2"
                                placeholder="Bairro"
                            />
                            <input
                                value={formData.numero}
                                onChange={(e) => setFormData({ ...formData, numero: e.target.value })}
                                className="border rounded px-3 py-2"
                                placeholder="Número"
                            />
                            <input
                                value={formData.complemento}
                                onChange={(e) => setFormData({ ...formData, complemento: e.target.value })}
                                className="border rounded px-3 py-2 col-span-2"
                                placeholder="Complemento"
                            />
                            <select
                                value={formData.tipo_pessoa}
                                onChange={(e) =>
                                    setFormData({ ...formData, tipo_pessoa: e.target.value })
                                }
                                className="border rounded px-3 py-2"
                            >
                                <option value="F">Pessoa Física</option>
                                <option value="J">Pessoa Jurídica</option>
                            </select>
                            <input
                                value={formData.cpf_cnpj}
                                onChange={(e) =>
                                    setFormData({ ...formData, cpf_cnpj: e.target.value })
                                }
                                className="border rounded px-3 py-2"
                                placeholder="CPF ou CNPJ"
                            />
                        </div>

                        {/* Botões */}
                        <div className="flex justify-end gap-3 mt-6">
                            <button
                                onClick={fecharCard}
                                className="px-4 py-2 rounded bg-gray-300 hover:bg-gray-400 text-gray-700 flex items-center gap-2"
                            >
                                <FaTimes /> Cancelar
                            </button>
                            <button
                                onClick={salvar}
                                disabled={!houveAlteracao || loading}
                                className={`px-4 py-2 rounded flex items-center gap-2 ${houveAlteracao
                                        ? "bg-green-600 hover:bg-green-700 text-white"
                                        : "bg-gray-300 text-gray-500 cursor-not-allowed"
                                    }`}
                            >
                                <FaSave /> {loading ? "Salvando..." : "Salvar"}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
