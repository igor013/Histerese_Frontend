// src/components/notas/ModalNota.jsx
import { useEffect, useRef, useState } from "react";
import { X } from "lucide-react";

import {
    criarNota,
    atualizarNota,
    importarXML,
} from "../../services/notaService";

import { listarFornecedores } from "../../services/fornecedorService";

import ModalCadastrarFornecedor from "./ModalCadastrarFornecedor";
import ModalCadastrarProduto from "./ModalCadastrarProduto";
import ModalVincularProduto from "./ModalVincularProduto";

export default function ModalNota({
    open,
    onClose,
    modoEdicao,
    selecionado,
    onSaved,
}) {
    const xmlInputRef = useRef(null);

    const [form, setForm] = useState({
        numero_nota: "",
        serie: "",
        fornecedor_id: "",
        data_emissao: "",
        valor_total: "",
        chave_acesso: "",
        inscricao_estadual: "",
        cnpj_fornecedor: "",
        razao_social_fornecedor: "",

        rua_fornecedor: "",
        numero_fornecedor: "",
        bairro_fornecedor: "",
        cidade_fornecedor: "",
        uf_fornecedor: "",
        cep_fornecedor: "",
        telefone_fornecedor: "",
        email_fornecedor: "",

        itens: [],
    });

    const [fornecedores, setFornecedores] = useState([]);
    const [salvando, setSalvando] = useState(false);

    const [modalFornecedorOpen, setModalFornecedorOpen] = useState(false);
    const [modalProdutoOpen, setModalProdutoOpen] = useState(false);
    const [modalVincularOpen, setModalVincularOpen] = useState(false);

    const [dadosFornecedorImportado, setDadosFornecedorImportado] = useState(null);
    const [itemSelecionado, setItemSelecionado] = useState(null);

    // ------------------------------------------------------
    // CARREGAR FORNECEDORES
    // ------------------------------------------------------
    async function carregarFornecedores() {
        try {
            const res = await listarFornecedores({ limit: 2000 });
            setFornecedores(Array.isArray(res) ? res : res?.items || []);
        } catch (err) {
            console.error("Erro ao carregar fornecedores:", err);
        }
    }

    // ------------------------------------------------------
    // CARREGAR NOTA EM EDIÇÃO
    // ------------------------------------------------------
    useEffect(() => {
        if (!open) return;

        carregarFornecedores();

        if (modoEdicao && selecionado) {
            setForm({
                numero_nota: selecionado.numero_nota ?? "",
                serie: selecionado.serie ?? "",
                fornecedor_id: selecionado.fornecedor_id ?? "",
                data_emissao: selecionado.data_emissao
                    ? selecionado.data_emissao.split("T")[0]
                    : "",
                valor_total: selecionado.valor_total ?? "",
                chave_acesso: selecionado.chave_acesso ?? "",
                inscricao_estadual: selecionado.inscricao_estadual ?? "",

                cnpj_fornecedor: selecionado.cnpj_fornecedor ?? "",
                razao_social_fornecedor: selecionado.razao_social_fornecedor ?? "",

                rua_fornecedor: selecionado.rua_fornecedor ?? "",
                numero_fornecedor: selecionado.numero_fornecedor ?? "",
                bairro_fornecedor: selecionado.bairro_fornecedor ?? "",
                cidade_fornecedor: selecionado.cidade_fornecedor ?? "",
                uf_fornecedor: selecionado.uf_fornecedor ?? "",
                cep_fornecedor: selecionado.cep_fornecedor ?? "",
                telefone_fornecedor: selecionado.telefone_fornecedor ?? "",
                email_fornecedor: selecionado.email_fornecedor ?? "",

                itens: selecionado.itens || [],
            });
        } else {
            setForm({
                numero_nota: "",
                serie: "",
                fornecedor_id: "",
                data_emissao: "",
                valor_total: "",
                itens: [],
            });

            if (xmlInputRef.current) xmlInputRef.current.value = "";
        }

        // eslint-disable-next-line
    }, [modoEdicao, selecionado, open]);

    // ------------------------------------------------------
    // IMPORTAÇÃO DE XML
    // ------------------------------------------------------
    async function handleImportXML(e) {
        const file = e.target.files[0];
        if (!file) return;

        try {
            const res = await importarXML(file);
            const nota = res.nota;

            // Preenche dados da nota
            setForm((f) => ({
                ...f,
                ...nota,
                itens: res.itens || [],
            }));

            const fornecedorDados = {
                razao_social: nota.razao_social_fornecedor,
                cnpj: nota.cnpj_fornecedor,
                ie: nota.inscricao_estadual,
                rua: nota.rua_fornecedor,
                numero: nota.numero_fornecedor,
                bairro: nota.bairro_fornecedor,
                cidade: nota.cidade_fornecedor,
                uf: nota.uf_fornecedor,
                cep: nota.cep_fornecedor,
                telefone: nota.telefone_fornecedor,
                email: nota.email_fornecedor,
            };

            setDadosFornecedorImportado(fornecedorDados);

            if (res.fornecedor.existe) {
                setForm((f) => ({
                    ...f,
                    fornecedor_id: res.fornecedor.id,
                }));
            } else {
                setTimeout(() => setModalFornecedorOpen(true), 150);
            }
        } catch (err) {
            console.error("Erro XML:", err);
            alert("Erro ao importar XML.");
        }
    }

    // ------------------------------------------------------
    // CANCELAR FORNECEDOR → RESET
    // ------------------------------------------------------
    function handleCloseFornecedor() {
        setModalFornecedorOpen(false);
        setDadosFornecedorImportado(null);
        setForm((f) => ({ ...f, fornecedor_id: "" }));

        if (xmlInputRef.current) xmlInputRef.current.value = "";
    }

    // ------------------------------------------------------
    // VALIDAR SALVAR
    // ------------------------------------------------------
    const tudoValido =
        form.fornecedor_id &&
        form.itens.length > 0 &&
        form.itens.every((i) => i.produto_id);

    // ------------------------------------------------------
    // SALVAR NOTA
    // ------------------------------------------------------
    async function salvar() {
        try {
            setSalvando(true);

            const payload = { ...form };

            if (modoEdicao) await atualizarNota(selecionado.id, payload);
            else await criarNota(payload);

            onSaved();
        } catch (err) {
            console.error("Erro ao salvar nota:", err);
            alert("Erro ao salvar nota.");
        } finally {
            setSalvando(false);
        }
    }

    if (!open) return null;

    // ======================================================
    // RENDER
    // ======================================================

    return (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50">
            <div className="bg-white w-[1000px] max-h-[90vh] rounded-lg shadow-lg flex flex-col">

                {/* CABEÇALHO */}
                <div className="flex items-center justify-between p-4 border-b">
                    <h2 className="text-xl font-semibold">
                        {modoEdicao ? "Editar Nota Fiscal" : "Nova Nota Fiscal"}
                    </h2>

                    <button
                        onClick={onClose}
                        className="text-gray-500 hover:text-gray-700"
                    >
                        <X size={22} />
                    </button>
                </div>

                {/* CONTEÚDO */}
                <div className="p-4 overflow-y-auto">

                    {/* DADOS NOTA */}
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm mb-1">Número</label>
                            <input
                                type="text"
                                value={form.numero_nota}
                                onChange={(e) =>
                                    setForm({
                                        ...form,
                                        numero_nota: e.target.value,
                                    })
                                }
                                className="w-full border rounded px-3 py-2"
                            />
                        </div>

                        <div>
                            <label className="block text-sm mb-1">Série</label>
                            <input
                                type="text"
                                value={form.serie}
                                onChange={(e) =>
                                    setForm({ ...form, serie: e.target.value })
                                }
                                className="w-full border rounded px-3 py-2"
                            />
                        </div>

                        <div>
                            <label className="block text-sm mb-1">
                                Data de Emissão
                            </label>
                            <input
                                type="date"
                                value={form.data_emissao}
                                onChange={(e) =>
                                    setForm({
                                        ...form,
                                        data_emissao: e.target.value,
                                    })
                                }
                                className="w-full border rounded px-3 py-2"
                            />
                        </div>

                        <div>
                            <label className="block text-sm mb-1">Valor</label>
                            <input
                                type="text"
                                value={form.valor_total}
                                onChange={(e) =>
                                    setForm({
                                        ...form,
                                        valor_total: e.target.value,
                                    })
                                }
                                className="w-full border rounded px-3 py-2"
                            />
                        </div>
                    </div>

                    {/* FORNECEDOR */}
                    <div className="mt-4">
                        <label className="block text-sm mb-1">Fornecedor</label>
                        <div className="flex gap-2">
                            <select
                                value={form.fornecedor_id}
                                onChange={(e) =>
                                    setForm({
                                        ...form,
                                        fornecedor_id: e.target.value,
                                    })
                                }
                                className="w-full border rounded px-3 py-2"
                            >
                                <option value="">Selecione...</option>

                                {fornecedores.map((f) => (
                                    <option key={f.id} value={f.id}>
                                        {f.nome}
                                    </option>
                                ))}
                            </select>

                            <button
                                onClick={() => setModalFornecedorOpen(true)}
                                className="bg-blue-600 hover:bg-blue-700 text-white px-4 rounded"
                            >
                                Cadastrar
                            </button>
                        </div>
                    </div>

                    {/* IMPORTAR XML */}
                    <div className="mt-4">
                        <label className="block text-sm mb-1">XML</label>
                        <input
                            ref={xmlInputRef}
                            type="file"
                            accept=".xml"
                            onChange={handleImportXML}
                            className="w-full border rounded px-3 py-2"
                        />
                    </div>

                    {/* DADOS DO FORNECEDOR */}
                    <div className="mt-6">
                        <h3 className="font-semibold text-gray-700 mb-2">
                            Dados do Fornecedor
                        </h3>

                        <div className="grid grid-cols-2 gap-4">

                            <input
                                className="bg-gray-100 border rounded px-3 py-2"
                                value={form.rua_fornecedor || ""}
                                disabled
                            />

                            <input
                                className="bg-gray-100 border rounded px-3 py-2"
                                value={form.numero_fornecedor || ""}
                                disabled
                            />

                            <input
                                className="bg-gray-100 border rounded px-3 py-2"
                                value={form.bairro_fornecedor || ""}
                                disabled
                            />

                            <input
                                className="bg-gray-100 border rounded px-3 py-2"
                                value={form.cep_fornecedor || ""}
                                disabled
                            />

                            <input
                                className="bg-gray-100 border rounded px-3 py-2"
                                value={form.cidade_fornecedor || ""}
                                disabled
                            />

                            <input
                                className="bg-gray-100 border rounded px-3 py-2"
                                value={form.uf_fornecedor || ""}
                                disabled
                            />

                            <input
                                className="bg-gray-100 border rounded px-3 py-2"
                                value={form.telefone_fornecedor || ""}
                                disabled
                            />

                            <input
                                className="bg-gray-100 border rounded px-3 py-2"
                                value={form.email_fornecedor || ""}
                                disabled
                            />
                        </div>
                    </div>

                    {/* ITENS */}
                    <div className="mt-6">
                        <h3 className="font-semibold mb-2">Itens da Nota</h3>

                        <table className="w-full border bg-white rounded">
                            <thead>
                                <tr className="bg-gray-50">
                                    <th className="px-2 py-2 text-left">
                                        Descrição
                                    </th>
                                    <th className="px-2 py-2">Qtd</th>
                                    <th className="px-2 py-2">Un</th>
                                    <th className="px-2 py-2">V. Unitário</th>
                                    <th className="px-2 py-2"></th>
                                </tr>
                            </thead>

                            <tbody>
                                {form.itens.length === 0 ? (
                                    <tr>
                                        <td
                                            colSpan="5"
                                            className="text-center py-3 text-gray-500"
                                        >
                                            Nenhum item
                                        </td>
                                    </tr>
                                ) : (
                                    form.itens.map((item, index) => (
                                        <tr
                                            key={index}
                                            className={`border-b ${!item.produto_id
                                                    ? "bg-red-50"
                                                    : ""
                                                }`}
                                        >
                                            <td className="px-2 py-1">
                                                {item.descricao}
                                            </td>

                                            <td className="px-2 py-1 text-center">
                                                {item.quantidade}
                                            </td>

                                            <td className="px-2 py-1 text-center">
                                                {item.unidade_medida}
                                            </td>

                                            <td className="px-2 py-1 text-center">
                                                {item.valor_unitario}
                                            </td>

                                            <td className="px-2 py-1 flex gap-2">

                                                {!item.produto_id && (
                                                    <>
                                                        <button
                                                            className="bg-blue-600 hover:bg-blue-700 text-white px-2 py-1 rounded text-sm"
                                                            onClick={() => {
                                                                setItemSelecionado({
                                                                    item,
                                                                    index,
                                                                });
                                                                setModalProdutoOpen(
                                                                    true
                                                                );
                                                            }}
                                                        >
                                                            Cadastrar Produto
                                                        </button>

                                                        <button
                                                            className="bg-gray-600 hover:bg-gray-700 text-white px-2 py-1 rounded text-sm"
                                                            onClick={() => {
                                                                setItemSelecionado({
                                                                    item,
                                                                    index,
                                                                });
                                                                setModalVincularOpen(
                                                                    true
                                                                );
                                                            }}
                                                        >
                                                            Vincular
                                                        </button>
                                                    </>
                                                )}

                                                {item.produto_id && (
                                                    <span className="text-green-700 font-semibold">
                                                        ✓ OK
                                                    </span>
                                                )}
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* RODAPÉ */}
                <div className="p-4 border-t flex justify-between bg-gray-50">
                    <button
                        onClick={onClose}
                        className="px-4 py-2 rounded border"
                    >
                        Cancelar
                    </button>

                    <button
                        onClick={salvar}
                        disabled={!tudoValido || salvando}
                        className={`px-5 py-2 rounded text-white ${tudoValido
                                ? "bg-green-600 hover:bg-green-700"
                                : "bg-gray-400 cursor-not-allowed"
                            }`}
                    >
                        {salvando ? "Salvando..." : "Salvar"}
                    </button>
                </div>
            </div>

            {/* MODAIS INTERNOS */}

            {/* FORNECEDOR */}
            {modalFornecedorOpen && (
                <ModalCadastrarFornecedor
                    open={modalFornecedorOpen}
                    dadosImportados={dadosFornecedorImportado}
                    onClose={handleCloseFornecedor}
                    onSaved={(novoId) => {
                        carregarFornecedores().then(() => {
                            setForm((f) => ({ ...f, fornecedor_id: novoId }));
                        });

                        setModalFornecedorOpen(false);
                    }}
                />
            )}

            {/* PRODUTO */}
            {modalProdutoOpen && (
                <ModalCadastrarProduto
                    open={modalProdutoOpen}
                    item={itemSelecionado}
                    fornecedorIdDaNota={form.fornecedor_id}
                    onClose={() => setModalProdutoOpen(false)}
                    onSaved={(novoProduto) => {
                        const itensAtualizados = [...form.itens];
                        itensAtualizados[itemSelecionado.index].produto_id =
                            novoProduto.id;

                        setForm({ ...form, itens: itensAtualizados });
                        setModalProdutoOpen(false);
                    }}
                />
            )}

            {/* VINCULAR PRODUTO */}
            {modalVincularOpen && (
                <ModalVincularProduto
                    open={modalVincularOpen}
                    item={itemSelecionado}
                    onClose={() => setModalVincularOpen(false)}
                    onVincular={(produtoEscolhido) => {
                        const itensAtualizados = [...form.itens];
                        itensAtualizados[itemSelecionado.index].produto_id =
                            produtoEscolhido.id;

                        setForm({ ...form, itens: itensAtualizados });
                        setModalVincularOpen(false);
                    }}
                />
            )}
        </div>
    );
}
