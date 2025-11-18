// src/pages/Notas.jsx
import { useEffect, useState } from "react";
import { Plus, Edit3 } from "lucide-react";

// Serviços
import {
    listarNotas,
    excluirNota,
    buscarNota,
} from "../services/notaService";

// Modais (serão criados nos próximos passos)
import ModalNota from "../components/notas/ModalNota";

export default function Notas() {
    const [notas, setNotas] = useState([]);
    const [loading, setLoading] = useState(true);

    const [modalOpen, setModalOpen] = useState(false);
    const [modoEdicao, setModoEdicao] = useState(false);
    const [selecionado, setSelecionado] = useState(null);

    // ---------------------------------------------
    // Carregar lista
    // ---------------------------------------------
    async function carregar() {
        try {
            setLoading(true);
            const lista = await listarNotas({ limit: 100 });
            setNotas(Array.isArray(lista) ? lista : lista?.items || []);
        } catch (err) {
            console.error("Erro ao listar notas:", err);
        } finally {
            setLoading(false);
        }
    }

    useEffect(() => {
        carregar();
    }, []);

    // ---------------------------------------------
    // Abrir modal
    // ---------------------------------------------
    async function abrirNovo() {
        setModoEdicao(false);
        setSelecionado(null);
        setModalOpen(true);
    }

    async function abrirEdicao(nota) {
        try {
            setModoEdicao(true);
            const dados = await buscarNota(nota.id);
            setSelecionado(dados);
            setModalOpen(true);
        } catch {
            alert("Erro ao carregar nota.");
        }
    }

    // ---------------------------------------------
    // Remover nota
    // ---------------------------------------------
    async function remover(nota) {
        if (!window.confirm("Deseja realmente excluir esta nota?")) return;

        try {
            await excluirNota(nota.id);
            await carregar();
        } catch {
            alert("Erro ao excluir nota.");
        }
    }

    // ---------------------------------------------
    // Render
    // ---------------------------------------------
    return (
        <div className="p-6">

            <h1 className="text-2xl font-semibold mb-6">
                Notas Fiscais
            </h1>

            {/* Barra de ações */}
            <div className="flex items-center justify-between mb-6">

                {/* FUTURO FILTRO – deixamos placeholder */}
                <div className="w-1/3">
                    <input
                        type="text"
                        placeholder="Filtrar por número, fornecedor..."
                        disabled
                        className="w-full border border-gray-300 rounded-lg px-3 py-2 bg-gray-100 text-gray-500 cursor-not-allowed"
                    />
                </div>

                <button
                    onClick={abrirNovo}
                    className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg flex items-center gap-2"
                >
                    <Plus size={18} />
                    Novo
                </button>
            </div>

            {/* Tabela */}
            <div className="bg-white rounded-lg shadow p-4 overflow-auto">
                <table className="w-full text-left">
                    <thead>
                        <tr className="border-b">
                            <th className="py-2 px-2">ID</th>
                            <th className="py-2 px-2">Número</th>
                            <th className="py-2 px-2">Fornecedor</th>
                            <th className="py-2 px-2">Data</th>
                            <th className="py-2 px-2">Valor Total</th>
                            <th className="py-2 px-2 text-right">Ações</th>
                        </tr>
                    </thead>

                    <tbody>
                        {loading ? (
                            <tr>
                                <td colSpan="6" className="text-center py-6">
                                    Carregando...
                                </td>
                            </tr>
                        ) : notas.length === 0 ? (
                            <tr>
                                <td colSpan="6" className="text-center py-6 text-gray-500">
                                    Nenhuma nota encontrada
                                </td>
                            </tr>
                        ) : (
                            notas.map((n) => (
                                <tr key={n.id} className="border-b hover:bg-gray-50">
                                    <td className="py-2 px-2">{n.id}</td>
                                    <td className="py-2 px-2">{n.numero_nota}</td>
                                    <td className="py-2 px-2">{n.fornecedor_nome}</td>
                                    <td className="py-2 px-2">
                                        {n.data_emissao
                                            ? new Date(n.data_emissao).toLocaleDateString("pt-BR")
                                            : "-"}
                                    </td>
                                    <td className="py-2 px-2">
                                        {Number(n.valor_total || 0).toLocaleString("pt-BR", {
                                            style: "currency",
                                            currency: "BRL",
                                        })}
                                    </td>

                                    <td className="py-2 px-2">
                                        <div className="flex justify-end gap-3">
                                            <button
                                                onClick={() => abrirEdicao(n)}
                                                className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-1 rounded flex items-center gap-1"
                                            >
                                                <Edit3 size={16} />
                                                Editar
                                            </button>

                                            <button
                                                onClick={() => remover(n)}
                                                className="bg-red-600 hover:bg-red-700 text-white px-3 py-1 rounded"
                                            >
                                                Excluir
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>

            {/* Modal principal */}
            {modalOpen && (
                <ModalNota
                    open={modalOpen}
                    onClose={() => setModalOpen(false)}
                    modoEdicao={modoEdicao}
                    selecionado={selecionado}
                    onSaved={() => {
                        setModalOpen(false);
                        carregar();
                    }}
                />
            )}
        </div>
    );
}
