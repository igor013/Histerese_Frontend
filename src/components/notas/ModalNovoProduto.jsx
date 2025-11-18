// src/components/notas/ModalNovoProduto.jsx
import { useEffect, useState } from "react";
import { X } from "lucide-react";

import { criarProduto, listarProdutos } from "../../services/produtoService";
import { listarFornecedores } from "../../services/fornecedorService";
import { listarGrupos } from "../../services/grupoService";

export default function ModalNovoProduto({ open, onClose, onCreated }) {
    const [form, setForm] = useState({
        nome: "",
        unidade_medida: "UN",
        grupo_id: "",
        fornecedor_id: "",
        valor_compra: "",
        valor_venda: "",
    });

    const [grupos, setGrupos] = useState([]);
    const [fornecedores, setFornecedores] = useState([]);
    const [salvando, setSalvando] = useState(false);

    useEffect(() => {
        if (open) carregarAuxiliares();
    }, [open]);

    async function carregarAuxiliares() {
        try {
            const g = await listarGrupos({ limit: 2000 });
            setGrupos(Array.isArray(g) ? g : g.items || []);

            const f = await listarFornecedores({ limit: 2000 });
            setFornecedores(Array.isArray(f) ? f : f.items || []);
        } catch (err) {
            console.error("Erro ao carregar listas auxiliares:", err);
        }
    }

    async function salvar() {
        if (!form.nome || !form.unidade_medida) {
            alert("Nome e unidade são obrigatórios.");
            return;
        }

        const payload = {
            nome: form.nome,
            unidade_medida: form.unidade_medida,
            grupo_id: form.grupo_id || null,
            fornecedor_id: form.fornecedor_id || null,
            valor_compra: Number(form.valor_compra) || 0,
            valor_venda: Number(form.valor_venda) || 0,
        };

        try {
            setSalvando(true);

            const novo = await criarProduto(payload);

            // Atualiza listagens
            await listarProdutos({ limit: 2000 });

            // Retorna produto criado ao chamador
            if (onCreated) onCreated(novo);

            onClose();
        } catch (err) {
            console.error("Erro ao criar produto:", err);
            alert("Erro ao criar produto.");
        } finally {
            setSalvando(false);
        }
    }

    if (!open) return null;

    return (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-[70]">
            <div className="bg-white w-[600px] max-h-[85vh] rounded-lg shadow-lg flex flex-col">

                {/* Cabeçalho */}
                <div className="flex items-center justify-between p-4 border-b">
                    <h2 className="text-lg font-semibold">Novo Produto</h2>
                    <button
                        onClick={onClose}
                        className="text-gray-600 hover:text-gray-800"
                    >
                        <X size={22} />
                    </button>
                </div>

                <div className="p-4 overflow-y-auto">

                    {/* Formulário */}
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
                            <label className="block text-sm mb-1">Unidade de Medida *</label>
                            <select
                                className="w-full border rounded px-3 py-2"
                                value={form.unidade_medida}
                                onChange={(e) =>
                                    setForm({ ...form, unidade_medida: e.target.value })
                                }
                            >
                                <option value="UN">UN</option>
                                <option value="KG">KG</option>
                                <option value="CX">CX</option>
                                <option value="PC">PC</option>
                                <option value="MT">MT</option>
                            </select>
                        </div>

                        <div>
                            <label className="block text-sm mb-1">Grupo</label>
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
                        </div>

                        <div className="col-span-2">
                            <label className="block text-sm mb-1">Fornecedor</label>
                            <select
                                className="w-full border rounded px-3 py-2"
                                value={form.fornecedor_id}
                                onChange={(e) =>
                                    setForm({ ...form, fornecedor_id: e.target.value })
                                }
                            >
                                <option value="">Selecione...</option>
                                {fornecedores.map((f) => (
                                    <option key={f.id} value={f.id}>
                                        {f.nome}
                                    </option>
                                ))}
                            </select>
                        </div>

                        <div>
                            <label className="block text-sm mb-1">Valor Compra</label>
                            <input
                                type="number"
                                className="w-full border rounded px-3 py-2"
                                value={form.valor_compra}
                                onChange={(e) =>
                                    setForm({ ...form, valor_compra: e.target.value })
                                }
                            />
                        </div>

                        <div>
                            <label className="block text-sm mb-1">Valor Venda</label>
                            <input
                                type="number"
                                className="w-full border rounded px-3 py-2"
                                value={form.valor_venda}
                                onChange={(e) =>
                                    setForm({ ...form, valor_venda: e.target.value })
                                }
                            />
                        </div>

                    </div>
                </div>

                {/* Rodapé */}
                <div className="flex justify-between p-4 border-t bg-gray-50">
                    <button
                        onClick={onClose}
                        className="px-4 py-2 rounded border"
                    >
                        Cancelar
                    </button>

                    <button
                        disabled={salvando}
                        onClick={salvar}
                        className="bg-green-600 hover:bg-green-700 text-white px-5 py-2 rounded"
                    >
                        {salvando ? "Salvando..." : "Salvar"}
                    </button>
                </div>

            </div>
        </div>
    );
}
