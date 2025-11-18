// src/components/grupos/ModalCadastrarGrupo.jsx
import { useEffect, useState } from "react";
import { X, Loader2 } from "lucide-react";
import { criarGrupo } from "../../services/grupoService";

export default function ModalCadastrarGrupo({
    open,
    onClose,
    onSaved,
}) {
    const [form, setForm] = useState({
        nome: "",
        descricao: "",
    });

    const [saving, setSaving] = useState(false);
    const [erro, setErro] = useState("");

    useEffect(() => {
        if (open) {
            setForm({ nome: "", descricao: "" });
            setErro("");
        }
    }, [open]);

    const camposValidos = () => form.nome.trim().length > 0;

    async function salvar() {
        if (!camposValidos()) {
            setErro("O campo nome é obrigatório.");
            return;
        }

        try {
            setSaving(true);

            const novoGrupo = await criarGrupo(form);

            if (onSaved) onSaved(novoGrupo.id);

            onClose();
        } catch (err) {
            console.error("Erro ao criar grupo:", err);
            setErro("Erro ao salvar grupo.");
        } finally {
            setSaving(false);
        }
    }

    if (!open) return null;

    return (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-[999]">
            <div className="bg-white rounded-xl shadow-lg w-full max-w-xl p-6 relative">

                {/* FECHAR */}
                <button
                    onClick={onClose}
                    className="absolute top-4 right-4 text-gray-400 hover:text-gray-600"
                >
                    <X size={20} />
                </button>

                <h2 className="text-xl font-semibold mb-4">Cadastrar Grupo</h2>

                {erro && (
                    <div className="mb-3 rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
                        {erro}
                    </div>
                )}

                {/* FORM */}
                <div className="flex flex-col gap-3">
                    <input
                        type="text"
                        placeholder="Nome do Grupo *"
                        value={form.nome}
                        onChange={(e) =>
                            setForm({ ...form, nome: e.target.value })
                        }
                        className="border rounded-lg px-3 py-2"
                    />

                    <textarea
                        placeholder="Descrição (opcional)"
                        value={form.descricao}
                        onChange={(e) =>
                            setForm({ ...form, descricao: e.target.value })
                        }
                        className="border rounded-lg px-3 py-2 h-24 resize-none"
                    />
                </div>

                {/* BOTÕES */}
                <div className="flex justify-end gap-3 mt-6">
                    <button
                        onClick={onClose}
                        className="px-4 py-2 rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-100"
                    >
                        Cancelar
                    </button>

                    <button
                        onClick={salvar}
                        disabled={!camposValidos() || saving}
                        className={`px-4 py-2 rounded-lg text-white ${camposValidos()
                                ? "bg-green-600 hover:bg-green-700"
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
    );
}
