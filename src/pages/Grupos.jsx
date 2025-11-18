import { useEffect, useState } from "react";
import { Plus, Edit3, Trash2, X, Loader2 } from "lucide-react";
import {
    listarGrupos,
    criarGrupo,
    atualizarGrupo,
    excluirGrupo,
} from "../services/grupoService";

const initialForm = { nome: "", descricao: "" };

export default function Grupos() {
    const [grupos, setGrupos] = useState([]);
    const [selecionado, setSelecionado] = useState(null);
    const [modalOpen, setModalOpen] = useState(false);
    const [modoEdicao, setModoEdicao] = useState(false);
    const [form, setForm] = useState(initialForm);
    const [saving, setSaving] = useState(false);
    const [erro, setErro] = useState("");
    const [confirmarExclusao, setConfirmarExclusao] = useState(false);

    // ====================================================
    // 🔄 CARREGAR LISTA
    // ====================================================
    async function carregar() {
        try {
            const res = await listarGrupos({ limit: 100 });
            const ordenados = (res.items || []).sort((a, b) =>
                (a.nome || "").localeCompare(b.nome || "")
            );
            setGrupos(ordenados);
        } catch (err) {
            console.error("Erro ao listar grupos:", err);
        }
    }

    useEffect(() => {
        carregar();
    }, []);

    // ====================================================
    // 🧾 MODAL
    // ====================================================
    function abrirModal(modo) {
        setModoEdicao(modo === "editar");
        setErro("");
        if (modo === "editar" && selecionado) {
            setForm({
                nome: selecionado.nome ?? "",
                descricao: selecionado.descricao ?? "",
            });
        } else {
            setForm(initialForm);
        }
        setModalOpen(true);
    }

    function fecharModal() {
        setModalOpen(false);
        setConfirmarExclusao(false);
        setErro("");
    }

    // ====================================================
    // 🧠 VALIDAÇÃO E SALVAR
    // ====================================================
    const camposValidos = () => form.nome.trim().length > 0;

    async function salvar() {
        if (!camposValidos()) {
            setErro("O campo nome é obrigatório.");
            return;
        }
        try {
            setSaving(true);
            if (modoEdicao && selecionado)
                await atualizarGrupo(selecionado.id, form);
            else await criarGrupo(form);
            fecharModal();
            carregar();
        } catch (err) {
            console.error("Erro ao salvar grupo:", err);
            setErro("Erro ao salvar grupo.");
        } finally {
            setSaving(false);
        }
    }

    async function excluir() {
        try {
            await excluirGrupo(selecionado.id);
            setSelecionado(null);
            carregar();
            fecharModal();
        } catch (err) {
            console.error("Erro ao excluir grupo:", err);
        }
    }

    // ====================================================
    // 🖥️ LAYOUT
    // ====================================================
    return (
        <div className="flex flex-col h-full">
            {/* TOPO */}
            <div className="flex items-center justify-between mb-4">
                <h1 className="text-2xl font-semibold">Grupos</h1>
                <div className="flex gap-2">
                    <button
                        onClick={() => abrirModal("novo")}
                        className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 flex items-center gap-2"
                    >
                        <Plus size={18} /> Novo
                    </button>
                    <button
                        onClick={() => abrirModal("editar")}
                        disabled={!selecionado}
                        className={`px-4 py-2 rounded-lg flex items-center gap-2 ${selecionado
                                ? "bg-blue-600 text-white hover:bg-blue-700"
                                : "bg-gray-200 text-gray-500 cursor-not-allowed"
                            }`}
                    >
                        <Edit3 size={18} /> Editar
                    </button>
                </div>
            </div>

            {/* TABELA */}
            <div className="flex-1 overflow-y-auto bg-white border border-gray-200 rounded-xl shadow-sm">
                <table className="w-full text-sm">
                    <thead className="bg-gray-50 text-gray-600">
                        <tr>
                            <th className="text-left px-4 py-3 font-medium">Nome</th>
                            <th className="text-left px-4 py-3 font-medium">Descrição</th>
                        </tr>
                    </thead>
                    <tbody>
                        {grupos.map((g) => (
                            <tr
                                key={g.id}
                                onClick={() =>
                                    setSelecionado(selecionado?.id === g.id ? null : g)
                                }
                                className={`cursor-pointer border-t hover:bg-blue-50 ${selecionado?.id === g.id ? "bg-blue-100" : ""
                                    }`}
                            >
                                <td className="px-4 py-2">{g.nome}</td>
                                <td className="px-4 py-2">{g.descricao ?? "-"}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {/* MODAL */}
            {modalOpen && (
                <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
                    <div className="bg-white rounded-2xl shadow-lg w-full max-w-4xl max-h-[90vh] overflow-y-auto p-6 relative">
                        {/* Fechar */}
                        <button
                            onClick={fecharModal}
                            className="absolute top-4 right-4 text-gray-400 hover:text-gray-600"
                        >
                            <X size={20} />
                        </button>

                        {/* Excluir (somente em edição) */}
                        {modoEdicao && (
                            <button
                                onClick={() => setConfirmarExclusao(true)}
                                className="absolute top-4 right-24 flex items-center gap-1 text-gray-500 hover:text-gray-700 text-sm font-medium"
                            >
                                <Trash2 size={16} /> Excluir
                            </button>
                        )}

                        <h2 className="text-xl font-semibold mb-4">
                            {modoEdicao ? "Editar Grupo" : "Novo Grupo"}
                        </h2>

                        {erro && (
                            <div className="mb-3 rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
                                {erro}
                            </div>
                        )}

                        {/* FORM */}
                        <div className="grid grid-cols-2 gap-3">
                            <input
                                type="text"
                                placeholder="Nome *"
                                value={form.nome}
                                onChange={(e) => setForm({ ...form, nome: e.target.value })}
                                className="col-span-2 border rounded-lg px-3 py-2"
                            />

                            <textarea
                                placeholder="Descrição"
                                value={form.descricao}
                                onChange={(e) =>
                                    setForm({ ...form, descricao: e.target.value })
                                }
                                className="col-span-2 border rounded-lg px-3 py-2 h-24 resize-none"
                            />
                        </div>

                        {/* BOTÕES */}
                        <div className="flex justify-end gap-3 mt-6">
                            <button
                                onClick={fecharModal}
                                className="px-4 py-2 rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-100"
                            >
                                Cancelar
                            </button>
                            <button
                                onClick={salvar}
                                disabled={!camposValidos() || saving}
                                className={`px-4 py-2 rounded-lg text-white ${camposValidos()
                                        ? "bg-blue-600 hover:bg-blue-700"
                                        : "bg-gray-300 cursor-not-allowed"
                                    }`}
                            >
                                {saving ? (
                                    <span className="inline-flex items-center gap-2">
                                        <Loader2 size={16} className="animate-spin" /> Salvando...
                                    </span>
                                ) : (
                                    "Salvar"
                                )}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* CONFIRMAR EXCLUSÃO */}
            {confirmarExclusao && (
                <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-[60]">
                    <div className="bg-white p-6 rounded-2xl shadow-lg max-w-md w-full">
                        <h3 className="text-lg font-semibold mb-2">Confirmar exclusão</h3>
                        <p className="text-gray-700 mb-6">
                            Tem certeza que deseja excluir o grupo{" "}
                            <strong>{selecionado?.nome}</strong>?
                        </p>
                        <div className="flex justify-end gap-3">
                            <button
                                onClick={() => setConfirmarExclusao(false)}
                                className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-100"
                            >
                                Cancelar
                            </button>
                            <button
                                onClick={excluir}
                                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
                            >
                                Confirmar exclusão
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
