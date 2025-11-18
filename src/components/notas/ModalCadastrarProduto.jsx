import { useEffect, useState } from "react";
import { X, Loader2 } from "lucide-react";
import { criarProduto } from "../../services/produtoService";
import { listarGrupos } from "../../services/grupoService";

import ModalCadastrarGrupo from "../grupos/ModalCadastrarGrupo";

export default function ModalCadastrarProduto({
    open,
    onClose,
    onSaved,
    item,
    fornecedorIdDaNota,
}) {
    const [form, setForm] = useState({
        nome: "",
        codigo: "",
        ean: "",
        unidade: "UN",
        grupo_id: "",
        fornecedor_id: fornecedorIdDaNota,
        valor_unitario: item?.item?.valor_unitario || "",
    });

    const [grupos, setGrupos] = useState([]);
    const [salvando, setSalvando] = useState(false);

    const [modalGrupoOpen, setModalGrupoOpen] = useState(false);

    async function carregarGrupos() {
        try {
            const res = await listarGrupos({ limit: 500 });
            setGrupos(res.items || res);
        } catch (err) {
            console.error("Erro ao carregar grupos:", err);
        }
    }

    useEffect(() => {
        if (open) {
            carregarGrupos();

            setForm((f) => ({
                ...f,
                nome: item?.item?.descricao || "",
                codigo: item?.item?.codigo || "",
                ean: item?.item?.ean || "",
                valor_unitario: item?.item?.valor_unitario || "",
                fornecedor_id: fornecedorIdDaNota,
            }));
        }
    }, [open]);

    async function salvar() {
        try {
            setSalvando(true);

            const payload = { ...form };

            const novoProduto = await criarProduto(payload);

            if (onSaved) onSaved(novoProduto);

            onClose();
        } catch (err) {
            console.error("Erro ao salvar produto:", err);
            alert("Erro ao salvar produto.");
        } finally {
            setSalvando(false);
        }
    }

    if (!open) return null;

    return (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-[999]">
            <div className="bg-white rounded-xl shadow-lg w-full max-w-3xl p-6 relative">

                {/* Fechar */}
                <button
                    onClick={onClose}
                    className="absolute top-4 right-4 text-gray-400 hover:text-gray-600"
                >
                    <X size={22} />
                </button>

                <h2 className="text-xl font-semibold mb-4">Cadastrar Produto</h2>

                {/* FORM */}
                <div className="grid grid-cols-2 gap-4">

                    <div className="col-span-2">
                        <label className="block text-sm mb-1">Nome *</label>
                        <input
                            type="text"
                            className="w-full border rounded px-3 py-2"
                            value={form.nome}
                            onChange={(e) =>
                                setForm({ ...form, nome: e.target.value })
                            }
                        />
                    </div>

                    <div>
                        <label className="block text-sm mb-1">Código</label>
                        <input
                            type="text"
                            className="w-full border rounded px-3 py-2"
                            value={form.codigo}
                            onChange={(e) =>
                                setForm({ ...form, codigo: e.target.value })
                            }
                        />
                    </div>

                    <div>
                        <label className="block text-sm mb-1">EAN</label>
                        <input
                            type="text"
                            className="w-full border rounded px-3 py-2"
                            value={form.ean}
                            onChange={(e) =>
                                setForm({ ...form, ean: e.target.value })
                            }
                        />
                    </div>

                    {/* GRUPO */}
                    <div className="col-span-2">
                        <label className="block text-sm mb-1">Grupo</label>

                        <div className="flex gap-2">
                            <select
                                className="w-full border rounded px-3 py-2"
                                value={form.grupo_id}
                                onChange={(e) =>
                                    setForm({ ...form, grupo_id: e.target.value })
                                }
                            >
                                <option value="">Selecione...</option>

                                {grupos.map((g) => (
                                    <option key={g.id} value={g.id}>
                                        {g.nome}
                                    </option>
                                ))}
                            </select>

                            <button
                                onClick={() => setModalGrupoOpen(true)}
                                className="bg-blue-600 hover:bg-blue-700 text-white px-3 rounded"
                            >
                                Cadastrar
                            </button>
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm mb-1">Unidade</label>
                        <input
                            type="text"
                            className="w-full border rounded px-3 py-2"
                            value={form.unidade}
                            onChange={(e) =>
                                setForm({ ...form, unidade: e.target.value })
                            }
                        />
                    </div>

                    <div>
                        <label className="block text-sm mb-1">Valor Unitário</label>
                        <input
                            type="text"
                            className="w-full border rounded px-3 py-2"
                            value={form.valor_unitario}
                            onChange={(e) =>
                                setForm({ ...form, valor_unitario: e.target.value })
                            }
                        />
                    </div>
                </div>

                {/* BOTÕES */}
                <div className="flex justify-end gap-3 mt-6">
                    <button
                        onClick={onClose}
                        className="px-4 py-2 rounded border"
                    >
                        Cancelar
                    </button>

                    <button
                        onClick={salvar}
                        disabled={!form.nome || salvando}
                        className="px-4 py-2 rounded text-white bg-green-600 hover:bg-green-700"
                    >
                        {salvando ? (
                            <span className="flex items-center gap-2">
                                <Loader2 size={18} className="animate-spin" />
                                Salvando...
                            </span>
                        ) : (
                            "Salvar"
                        )}
                    </button>
                </div>
            </div>

            {/* MODAL GRUPO */}
            {modalGrupoOpen && (
                <ModalCadastrarGrupo
                    open={modalGrupoOpen}
                    onClose={() => setModalGrupoOpen(false)}
                    onSaved={(grupoId) => {
                        carregarGrupos().then(() => {
                            setForm((f) => ({ ...f, grupo_id: grupoId }));
                        });
                        setModalGrupoOpen(false);
                    }}
                />
            )}
        </div>
    );
}
