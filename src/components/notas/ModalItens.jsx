// src/components/notas/ModalNota.jsx
import { useEffect, useState } from "react";
import { X, Trash2 } from "lucide-react";
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
    onSaved
}) {

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

        // CAMPOS DO FORNECEDOR (NOVOS)
        rua_fornecedor: "",
        numero_fornecedor: "",
        bairro_fornecedor: "",
        cidade_fornecedor: "",
        uf_fornecedor: "",
        cep_fornecedor: "",
        telefone_fornecedor: "",
        email_fornecedor: "",

        itens: []
    });

    const [fornecedores, setFornecedores] = useState([]);
    const [salvando, setSalvando] = useState(false);

    const [modalFornecedorOpen, setModalFornecedorOpen] = useState(false);
    const [modalProdutoOpen, setModalProdutoOpen] = useState(false);
    const [modalVincularOpen, setModalVincularOpen] = useState(false);

    const [dadosFornecedorImportado, setDadosFornecedorImportado] = useState(null);

    const [itemSelecionado, setItemSelecionado] = useState(null);

    // ------------------------------------------------------
    // LISTAR FORNECEDORES
    // ------------------------------------------------------
    async function carregarFornecedores() {
        try {
            const res = await listarFornecedores({ limit: 2000 });
            setFornecedores(Array.isArray(res) ? res : res?.items || []);
        } catch (err) {
            console.error("Erro ao listar fornecedores:", err);
        }
    }

    // ------------------------------------------------------
    // CARREGA DADOS DA NOTA EM EDIÇÃO
    // ------------------------------------------------------
    useEffect(() => {
        carregarFornecedores();

        if (modoEdicao && selecionado) {
            setForm({
                ...form,
                numero_nota: selecionado.numero_nota ?? "",
                serie: selecionado.serie ?? "",
                fornecedor_id: selecionado.fornecedor_id ?? "",
                data_emissao: selecionado.data_emissao
                    ? String(selecionado.data_emissao).split("T")[0]
                    : "",
                valor_total: selecionado.valor_total ?? "",
                cnpj_fornecedor: selecionado.cnpj_fornecedor ?? "",
                razao_social_fornecedor: selecionado.razao_social_fornecedor ?? "",
                chave_acesso: selecionado.chave_acesso ?? "",

                rua_fornecedor: selecionado.endereco_fornecedor?.split(",")[0] || "",
                numero_fornecedor: selecionado.endereco_fornecedor?.split(",")[1]?.trim() || "",
                bairro_fornecedor: selecionado.bairro_fornecedor ?? "",
                cidade_fornecedor: selecionado.cidade_fornecedor ?? "",
                uf_fornecedor: selecionado.uf_fornecedor ?? "",
                cep_fornecedor: selecionado.cep_fornecedor ?? "",
                telefone_fornecedor: selecionado.telefone_fornecedor ?? "",
                email_fornecedor: selecionado.email_fornecedor ?? "",

                itens: selecionado.itens || []
            });
        } else {
            setForm((f) => ({
                ...f,
                numero_nota: "",
                serie: "",
                fornecedor_id: "",
                data_emissao: "",
                valor_total: "",
                itens: []
            }));
        }

        // eslint-disable-next-line
    }, [modoEdicao, selecionado]);

    // ------------------------------------------------------
    // IMPORTAR XML
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
                itens: res.itens || []
            }));

            // Dados completos para o modal de fornecedor
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

            // Se fornecedor existe → preencher ID
            if (res.fornecedor.existe) {
                setForm((f) => ({
                    ...f,
                    fornecedor_id: res.fornecedor.id,
                }));
            } else {
                // Se não existe → abrir modal automaticamente
                setTimeout(() => {
                    setModalFornecedorOpen(true);
                }, 200);

                setForm((f) => ({
                    ...f,
                    fornecedor_id: "",
                }));
            }

        } catch (err) {
            console.error("Erro XML:", err);
            alert("Erro ao importar XML.");
        }
    }

    // ------------------------------------------------------
    // Botão salvar só libera quando tudo OK
    // ------------------------------------------------------
    const tudoValido =
        form.fornecedor_id &&
        form.itens.length > 0 &&
        form.itens.every((i) => i.produto_id);

    // ------------------------------------------------------
    // SALVAR
    // ------------------------------------------------------
    async function salvar() {
        try {
            setSalvando(true);

            const payload = { ...form };

            if (modoEdicao) await atualizarNota(selecionado.id, payload);
            else await criarNota(payload);

            onSaved();
        } catch (err) {
            console.error("Erro ao salvar:", err);
            alert("Erro ao salvar nota fiscal.");
        } finally {
            setSalvando(false);
        }
    }

    if (!open) return null;

    return (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50">
            <div className="bg-white w-[900px] max-h-[90vh] rounded-lg shadow-lg flex flex-col">

                {/* Cabeçalho */}
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

                {/* Conteúdo */}
                <div className="p-4 overflow-y-auto">

                    <div className="grid grid-cols-2 gap-4">

                        {/* Número */}
                        <div>
                            <label className="block text-sm mb-1">Número da Nota</label>
                            <input
                                type="text"
                                className="w-full border rounded px-3 py-2"
                                value={form.numero_nota}
                                onChange={(e) =>
                                    setForm({ ...form, numero_nota: e.target.value })
                                }
                            />
                        </div>

                        {/* Serie */}
                        <div>
                            <label className="block text-sm mb-1">Série</label>
                            <input
                                type="text"
                                className="w-full border rounded px-3 py-2"
                                value={form.serie}
                                onChange={(e) =>
                                    setForm({ ...form, serie: e.target.value })
                                }
                            />
                        </div>

                        {/* Data */}
                        <div>
                            <label className="block text-sm mb-1">Data de Emissão</label>
                            <input
                                type="date"
                                className="w-full border rounded px-3 py-2"
                                value={form.data_emissao}
                                onChange={(e) =>
                                    setForm({ ...form, data_emissao: e.target.value })
                                }
                            />
                        </div>

                        {/* Valor */}
                        <div>
                            <label className="block text-sm mb-1">Valor Total</label>
                            <input
                                type="text"
                                className="w-full border rounded px-3 py-2"
                                value={form.valor_total}
                                onChange={(e) =>
                                    setForm({ ...form, valor_total: e.target.value })
                                }
                            />
                        </div>

                        {/* Fornecedor */}
                        <div className="col-span-2">
                            <label className="block text-sm mb-1">Fornecedor</label>

                            <div className="flex gap-2">

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

                                <button
                                    onClick={() => setModalFornecedorOpen(true)}
                                    className="bg-blue-600 hover:bg-blue-700 text-white px-3 rounded"
                                >
                                    Cadastrar
                                </button>
                            </div>
                        </div>

                        {/* IMPORTAR XML */}
                        <div className="col-span-2">
                            <label className="block text-sm mb-1">Importar XML</label>
                            <input
                                type="file"
                                accept=".xml"
                                className="w-full border rounded px-3 py-2"
                                onChange={handleImportXML}
                            />
                        </div>

                        {/* ------------------- BLOCO DE DADOS DO FORNECEDOR ------------------- */}

                        <div className="col-span-2 mt-4">
                            <h3 className="font-semibold text-gray-700 mb-2">
                                Dados do Fornecedor (XML)
                            </h3>
                        </div>

                        <div>
                            <label className="text-sm">Rua</label>
                            <input
                                disabled
                                className="w-full border rounded px-3 py-2 bg-gray-100"
                                value={form.rua_fornecedor}
                                readOnly
                            />
                        </div>

                        <div>
                            <label className="text-sm">Número</label>
                            <input
                                disabled
                                className="w-full border rounded px-3 py-2 bg-gray-100"
                                value={form.numero_fornecedor}
                                readOnly
                            />
                        </div>

                        <div>
                            <label className="text-sm">Bairro</label>
                            <input
                                disabled
                                className="w-full border rounded px-3 py-2 bg-gray-100"
                                value={form.bairro_fornecedor}
                                readOnly
                            />
                        </div>

                        <div>
                            <label className="text-sm">CEP</label>
                            <input
                                disabled
                                className="w-full border rounded px-3 py-2 bg-gray-100"
                                value={form.cep_fornecedor}
                                readOnly
                            />
                        </div>

                        <div>
                            <label className="text-sm">Cidade</label>
                            <input
                                disabled
                                className="w-full border rounded px-3 py-2 bg-gray-100"
                                value={form.cidade_fornecedor}
                                readOnly
                            />
                        </div>

                        <div>
                            <label className="text-sm">UF</label>
                            <input
                                disabled
                                className="w-full border rounded px-3 py-2 bg-gray-100"
                                value={form.uf_fornecedor}
                                readOnly
                            />
                        </div>

                        <div>
                            <label className="text-sm">Telefone</label>
                            <input
                                disabled
                                className="w-full border rounded px-3 py-2 bg-gray-100"
                                value={form.telefone_fornecedor}
                                readOnly
                            />
                        </div>

                        <div>
                            <label className="text-sm">E-mail</label>
                            <input
                                disabled
                                className="w-full border rounded px-3 py-2 bg-gray-100"
                                value={form.email_fornecedor}
                                readOnly
                            />
                        </div>

                    </div>

                    {/* ------------------- ITENS ------------------- */}

                    <div className="mt-6">
                        <h3 className="font-semibold mb-1">Itens da Nota</h3>

                        <table className="w-full bg-white border rounded">
                            <thead>
                                <tr className="bg-gray-50 border-b">
                                    <th className="py-2 px-2">Descrição</th>
                                    <th className="py-2 px-2">Qtd</th>
                                    <th className="py-2 px-2">Un</th>
                                    <th className="py-2 px-2">V. Unitário</th>
                                    <th className="py-2 px-2"></th>
                                </tr>
                            </thead>

                            <tbody>
                                {form.itens.length === 0 ? (
                                    <tr>
                                        <td colSpan="5" className="text-center py-4 text-gray-500">
                                            Nenhum item
                                        </td>
                                    </tr>
                                ) : (
                                    form.itens.map((item, index) => (
                                        <tr
                                            key={index}
                                            className={`border-b ${!item.produto_id ? "bg-red-50" : ""
                                                }`}
                                        >
                                            <td className="px-2 py-1">{item.descricao}</td>
                                            <td className="px-2 py-1">{item.quantidade}</td>
                                            <td className="px-2 py-1">{item.unidade_medida}</td>
                                            <td className="px-2 py-1">{item.valor_unitario}</td>

                                            <td className="px-2 py-1 flex gap-2">

                                                {!item.produto_id && (
                                                    <>
                                                        <button
                                                            className="bg-blue-600 hover:bg-blue-700 text-white px-2 py-1 rounded text-sm"
                                                            onClick={() => {
                                                                setItemSelecionado({ item, index });
                                                                setModalProdutoOpen(true);
                                                            }}
                                                        >
                                                            Cadastrar Produto
                                                        </button>

                                                        <button
                                                            className="bg-gray-600 hover:bg-gray-700 text-white px-2 py-1 rounded text-sm"
                                                            onClick={() => {
                                                                setItemSelecionado({ item, index });
                                                                setModalVincularOpen(true);
                                                            }}
                                                        >
                                                            Vincular Existente
                                                        </button>
                                                    </>
                                                )}

                                                {item.produto_id && (
                                                    <span className="text-green-700 font-semibold">
                                                        ✓ Produto OK
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

                {/* Rodapé */}
                <div className="flex justify-between p-4 border-t bg-gray-50">

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

            {/* SUBMODAIS */}
            {modalFornecedorOpen && (
                <ModalCadastrarFornecedor
                    open={modalFornecedorOpen}
                    dadosImportados={dadosFornecedorImportado}
                    onClose={() => setModalFornecedorOpen(false)}
                    onSaved={(novoId) => {
                        carregarFornecedores().then(() => {
                            setForm((f) => ({ ...f, fornecedor_id: novoId }));
                        });
                        setModalFornecedorOpen(false);
                    }}
                />
            )}

            {modalProdutoOpen && (
                <ModalCadastrarProduto
                    open={modalProdutoOpen}
                    item={itemSelecionado}
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
