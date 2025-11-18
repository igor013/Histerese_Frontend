// src/components/notas/ModalVincularProduto.jsx
import { useEffect, useState } from "react";
import { X, Search } from "lucide-react";
import { listarProdutos } from "../../services/produtoService";

export default function ModalVincularProduto({
    open,
    onClose,
    item,
    onVincular
}) {

    const [busca, setBusca] = useState("");
    const [loading, setLoading] = useState(false);
    const [lista, setLista] = useState([]);
    const [selecionado, setSelecionado] = useState(null);

    // Carregar lista inicial
    useEffect(() => {
        if (!open) return;
        buscarProdutos();
    }, [open]);

    async function buscarProdutos() {
        try {
            setLoading(true);
            const resultado = await listarProdutos({
                q: busca,
                limit: 1000,
                status: "ativo"
            });

            let itens = Array.isArray(resultado)
                ? resultado
                : resultado.items;

            setLista(itens || []);

        } catch (err) {
            console.error("Erro ao buscar produtos:", err);
        } finally {
            setLoading(false);
        }
    }

    if (!open) return null;

    return (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-[999]">
            <div className="bg-white w-[700px] max-h-[85vh] rounded-xl shadow-lg flex flex-col">

                {/* Cabeçalho */}
                <div className="flex items-center justify-between p-4 border-b">
                    <h2 className="text-xl font-semibold">Vincular Produto Existente</h2>

                    <button
                        onClick={onClose}
                        className="text-gray-500 hover:text-gray-700"
                    >
                        <X size={22} />
                    </button>
                </div>

                {/* Campo de busca */}
                <div className="p-4 border-b">
                    <div className="flex gap-2">
                        <input
                            type="text"
                            placeholder="Buscar por nome, código, EAN, NCM..."
                            className="w-full border rounded px-3 py-2"
                            value={busca}
                            onChange={(e) => setBusca(e.target.value)}
                        />

                        <button
                            onClick={buscarProdutos}
                            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded flex items-center gap-1"
                        >
                            <Search size={18} />
                            Buscar
                        </button>
                    </div>
                </div>

                {/* Lista */}
                <div className="p-4 overflow-y-auto">

                    {loading ? (
                        <div className="text-center py-5">Carregando...</div>
                    ) : lista.length === 0 ? (
                        <div className="text-center py-5 text-gray-500">
                            Nenhum produto encontrado
                        </div>
                    ) : (
                        <table className="w-full border bg-white rounded">
                            <thead>
                                <tr className="bg-gray-50 border-b text-sm">
                                    <th className="py-2 px-2 text-left">Nome</th>
                                    <th className="py-2 px-2 text-left">Código</th>
                                    <th className="py-2 px-2 text-left">EAN</th>
                                    <th className="py-2 px-2 text-left">Un</th>
                                </tr>
                            </thead>

                            <tbody>
                                {lista.map((p) => (
                                    <tr
                                        key={p.id}
                                        onClick={() => setSelecionado(p)}
                                        className={`border-b cursor-pointer hover:bg-blue-50 ${selecionado?.id === p.id
                                                ? "bg-blue-100"
                                                : ""
                                            }`}
                                    >
                                        <td className="py-2 px-2">{p.nome}</td>
                                        <td className="py-2 px-2">{p.codigo}</td>
                                        <td className="py-2 px-2">{p.ean}</td>
                                        <td className="py-2 px-2">{p.unidade}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    )}

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
                        onClick={() => {
                            if (!selecionado) {
                                alert("Selecione um produto.");
                                return;
                            }
                            onVincular(selecionado);
                        }}
                        disabled={!selecionado}
                        className={`px-6 py-2 rounded text-white ${selecionado
                                ? "bg-green-600 hover:bg-green-700"
                                : "bg-gray-400 cursor-not-allowed"
                            }`}
                    >
                        Vincular
                    </button>
                </div>

            </div>
        </div>
    );
}
