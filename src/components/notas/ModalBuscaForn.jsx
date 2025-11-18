// src/components/notas/ModalBuscaForn.jsx
import { useEffect, useState } from "react";
import { X, Search, Plus } from "lucide-react";
import { listarFornecedores } from "../../services/fornecedorService";

export default function ModalBuscaForn({
    open,
    onClose,
    onSelect,
    onNovoFornecedor
}) {

    const [lista, setLista] = useState([]);
    const [filtro, setFiltro] = useState("");

    useEffect(() => {
        if (open) carregar();
    }, [open]);

    async function carregar() {
        try {
            const res = await listarFornecedores({ limit: 2000 });
            setLista(Array.isArray(res) ? res : res.items || []);
        } catch (err) {
            console.error("Erro ao listar fornecedores:", err);
        }
    }

    if (!open) return null;

    const filtrados = lista.filter((f) =>
        String(f.nome || "").toLowerCase().includes(filtro.toLowerCase()) ||
        String(f.id).includes(filtro)
    );

    return (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-[60]">
            <div className="bg-white w-[600px] max-h-[85vh] rounded-lg shadow-lg flex flex-col">

                {/* Cabeçalho */}
                <div className="flex items-center justify-between p-4 border-b">
                    <h2 className="text-lg font-semibold">Buscar Fornecedor</h2>

                    <button onClick={onClose} className="text-gray-600 hover:text-gray-800">
                        <X size={22} />
                    </button>
                </div>

                {/* Corpo */}
                <div className="p-4 overflow-y-auto">

                    {/* Barra de busca */}
                    <div className="flex items-center gap-2 mb-4">
                        <div className="flex-1 relative">
                            <Search
                                size={18}
                                className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                            />
                            <input
                                type="text"
                                placeholder="Buscar por nome ou ID..."
                                className="w-full pl-9 border rounded px-3 py-2"
                                value={filtro}
                                onChange={(e) => setFiltro(e.target.value)}
                            />
                        </div>

                        <button
                            onClick={onNovoFornecedor}
                            className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded flex items-center gap-2"
                        >
                            <Plus size={18} />
                            Novo
                        </button>
                    </div>

                    {/* Lista filtrada */}
                    <div className="border rounded-lg bg-gray-50 divide-y">
                        {filtrados.length === 0 ? (
                            <div className="p-4 text-center text-gray-500">
                                Nenhum fornecedor encontrado
                            </div>
                        ) : (
                            filtrados.map((f) => (
                                <div
                                    key={f.id}
                                    onClick={() => onSelect(f)}
                                    className="p-3 hover:bg-gray-100 cursor-pointer flex justify-between items-center"
                                >
                                    <div>
                                        <div className="font-semibold">{f.nome}</div>
                                        <div className="text-sm text-gray-600">
                                            ID: {f.id} • {f.cidade} / {f.uf}
                                        </div>
                                    </div>

                                    <div className="text-sm text-gray-700">
                                        {f.telefone}
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </div>

                {/* Rodapé */}
                <div className="flex justify-end p-4 border-t bg-gray-50">
                    <button onClick={onClose} className="px-4 py-2 rounded border">
                        Fechar
                    </button>
                </div>
            </div>
        </div>
    );
}
