import { useEffect, useMemo, useRef, useState } from "react";
import { Plus, Edit3, Trash2, X, Loader2, Check } from "lucide-react";
import {
  listarProdutos,
  criarProduto,
  atualizarProduto,
  excluirProduto,
  restaurarProduto,
} from "../services/produtoService";
import { listarFornecedores } from "../services/fornecedorService";
import { listarGrupos } from "../services/grupoService"; // ✅ Import do service

// ====================================================
// 🧩 Utilitários
// ====================================================
function toNumberOrNull(v) {
  if (v === null || v === undefined || v === "") return null;
  const n = Number(String(v).replace(",", "."));
  return Number.isFinite(n) ? n : null;
}

const initialForm = {
  nome: "",
  unidade_medida: "UN",
  quantidade: "",
  valor_compra: "",
  valor_venda: "",
  grupo_id: "",
  fornecedor_id: "",
  numero_nota: "",
};

// ====================================================
// 📄 COMPONENTE PRINCIPAL
// ====================================================
export default function Produtos() {
  const [produtos, setProdutos] = useState([]);
  const [fornecedores, setFornecedores] = useState([]);
  const [grupos, setGrupos] = useState([]); // ✅ sempre array
  const [selecionado, setSelecionado] = useState(null);

  const [modalOpen, setModalOpen] = useState(false);
  const [modoEdicao, setModoEdicao] = useState(false);
  const [saving, setSaving] = useState(false);
  const [erro, setErro] = useState("");
  const [confirmarExclusao, setConfirmarExclusao] = useState(false);

  const [form, setForm] = useState(initialForm);

  // =======================
  // Filtros da listagem
  // =======================
  const [filtro, setFiltro] = useState({
    id: "",
    nome: "",
    grupo_nome: "",
    fornecedor_nome: "",
    grupo_id: "",
    fornecedor_id: "",
    unidade: "",
    status: "ativos", // todos | ativos | inativos
  });

  const produtosFiltrados = useMemo(() => {
    const norm = (s) => String(s ?? "").toLowerCase();
    return produtos.filter((p) => {
      if (filtro.id && String(p.id) !== String(filtro.id)) return false;
      if (filtro.nome && !norm(p.nome).includes(norm(filtro.nome))) return false;
      if (filtro.grupo_nome && !norm(p.grupo_nome).includes(norm(filtro.grupo_nome))) return false;
      if (filtro.fornecedor_nome && !norm(p.fornecedor_nome).includes(norm(filtro.fornecedor_nome))) return false;
      if (filtro.grupo_id && String(p.grupo_id ?? "") !== String(filtro.grupo_id)) return false;
      if (filtro.fornecedor_id && String(p.fornecedor_id ?? "") !== String(filtro.fornecedor_id)) return false;
      if (filtro.unidade && String(p.unidade_medida ?? "") !== String(filtro.unidade)) return false;
      return true;
    });
  }, [produtos, filtro]);

  // =======================
  // Helpers de moeda e input com máscara "R$"
  // =======================
  function formatCurrencyBR(value, withSymbol = true) {
    const n =
      typeof value === "number"
        ? value
        : (parseFloat(String(value).replace(/[\\.]/g, "").replace(",", ".")) || 0);
    return n.toLocaleString("pt-BR", withSymbol
      ? { style: "currency", currency: "BRL" }
      : { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  }

  function parseToNumberBR(text) {
    const onlyDigits = String(text).replace(/[^\d]/g, "");
    const cents = (parseInt(onlyDigits || "0", 10)) / 100;
    return Number.isFinite(cents) ? cents : 0;
  }

  const MoneyInput = useMemo(() => {
    return function MoneyInput({ value, onValueChange, placeholder = "R$ 0,00", ...rest }) {
      const [display, setDisplay] = useState(
        value != null && value !== "" ? formatCurrencyBR(value, true) : ""
      );
      const prevValueRef = useRef(value);

      useEffect(() => {
        if (value !== prevValueRef.current) {
          prevValueRef.current = value;
          setDisplay(value == null || value === "" ? "" : formatCurrencyBR(value, true));
        }
      }, [value]);

      function handleChange(e) {
        const numeric = parseToNumberBR(e.target.value);
        setDisplay(formatCurrencyBR(numeric, true));
        onValueChange?.(numeric);
      }

      function handleFocus(e) {
        if (!display) setDisplay("R$ 0,00");
        requestAnimationFrame(() => e.target.select());
      }

      return (
        <input
          inputMode="numeric"
          value={display}
          onChange={handleChange}
          onFocus={handleFocus}
          placeholder={placeholder}
          {...rest}
        />
      );
    }
  }, []);

  // =======================
  // Largura ajustável das colunas
  // =======================
  const [columnWidths, setColumnWidths] = useState({
    nome: 380,
    grupo: 160,
    fornecedor: 220,
    qtd: 100,
    unid: 80,
    compra: 140,
    venda: 140,
  });

  const resizeStateRef = useRef(null);
  function startResize(e, key) {
    const th = e.currentTarget.parentElement;
    resizeStateRef.current = { key, startX: e.clientX, startWidth: th.offsetWidth };
    window.addEventListener("mousemove", onMouseMove);
    window.addEventListener("mouseup", onMouseUp, { once: true });
  }
  function onMouseMove(e) {
    const st = resizeStateRef.current;
    if (!st) return;
    const delta = e.clientX - st.startX;
    const newWidth = Math.max(60, st.startWidth + delta);
    setColumnWidths((w) => ({ ...w, [st.key]: newWidth }));
  }
  function onMouseUp() {
    window.removeEventListener("mousemove", onMouseMove);
    resizeStateRef.current = null;
  }

  // ====================================================
  // 🔄 CARREGAR LISTA (ordem alfabética por nome)
  // ====================================================
  const carregar = async (statusArg = 'ativo') => {
    try {
      const res = await listarProdutos({ page: 1, limit: 100, q: "", status: statusArg });
      const items = Array.isArray(res?.items) ? res.items : [];
      const ordenada = [...items].sort((a, b) =>
        (a?.nome || "").localeCompare(b?.nome || "")
      );
      setProdutos(ordenada);
    } catch (err) {
      console.error("Erro ao carregar produtos:", err);
    }
  };

  useEffect(() => {
    carregar('ativo');
  }, []);

  useEffect(() => {
    if (filtro.status === 'ativos') carregar('ativo');
    else if (filtro.status === 'inativos') carregar('inativo');
    else carregar('todos');
  }, [filtro.status]);

  // ====================================================
  // 🔄 CARREGAR GRUPOS (com proteção de tipo)
  // ====================================================
  const carregarGrupos = async () => {
    try {
      const res = await listarGrupos({ limit: 100 });
      const lista = Array.isArray(res)
        ? res
        : Array.isArray(res?.items)
        ? res.items
        : [];
      setGrupos(lista);
    } catch (err) {
      console.error("Erro ao listar grupos:", err);
      setGrupos([]);
    }
  };

  useEffect(() => {
    carregarGrupos();
  }, []);

  // ====================================================
  // Carregar Fornecedores
  // ====================================================
  const carregarFornecedores = async () => {
    try {
      const lista = await listarFornecedores();
      setFornecedores(Array.isArray(lista) ? lista : []);
    } catch (err) {
      console.error("Erro ao listar fornecedores:", err);
      setFornecedores([]);
    }
  };

  useEffect(() => {
    carregarFornecedores();
  }, []);

  // ====================================================
  // 🧾 ABRIR / FECHAR MODAL
  // ====================================================
  const abrirModal = (modo = "novo") => {
    setModoEdicao(modo === "editar");
    setErro("");

    if (modo === "editar" && selecionado) {
      setForm({
        nome: selecionado.nome ?? "",
        unidade_medida: selecionado.unidade_medida ?? "UN",
        quantidade: selecionado.quantidade ?? "",
        valor_compra: selecionado.valor_compra ?? "",
        valor_venda: selecionado.valor_venda ?? "",
        grupo_id: selecionado.grupo_id ?? "",
        fornecedor_id: selecionado.fornecedor_id ?? "",
        numero_nota: selecionado.numero_nota ?? "",
      });
    } else {
      setForm(initialForm);
    }
    setModalOpen(true);
  };

  const fecharModal = () => {
    setModalOpen(false);
    setConfirmarExclusao(false);
    setErro("");
  };

  // ====================================================
  // 🧪 VALIDAÇÃO E SALVAR
  // ====================================================
  const camposValidos = () => {
    const nomeOK = form.nome?.trim();
    const unidadeOK = form.unidade_medida?.trim();
    const qtd = toNumberOrNull(form.quantidade);
    const venda = toNumberOrNull(form.valor_venda);

    if (!nomeOK || !unidadeOK) return false;
    if (qtd === null || venda === null) return false;

    return true;
  };

  const salvar = async () => {
    if (!camposValidos()) {
      setErro("Preencha os campos obrigatórios corretamente.");
      return;
    }

    try {
      setSaving(true);

      const payload = {
        nome: form.nome?.trim() || null,
        unidade_medida: form.unidade_medida || null,
        quantidade: toNumberOrNull(form.quantidade),
        valor_compra: toNumberOrNull(form.valor_compra),
        valor_venda: toNumberOrNull(form.valor_venda),
        grupo_id: form.grupo_id || null,
        fornecedor_id: form.fornecedor_id ? Number(form.fornecedor_id) : null,
        numero_nota: form.numero_nota?.trim() || null,
      };

      if (modoEdicao && selecionado) {
        await atualizarProduto(selecionado.id, payload);
      } else {
        await criarProduto(payload);
      }
      fecharModal();
      carregar();
    } catch (err) {
      console.error("Erro ao salvar produto:", err);
      setErro(err?.response?.data?.erro || "Erro ao salvar produto.");
    } finally {
      setSaving(false);
    }
  };

  // ====================================================
  // 🗑️ EXCLUIR
  // ====================================================
  const excluir = async () => {
    try {
      await excluirProduto(selecionado.id);
      setSelecionado(null);
      carregar();
      fecharModal();
    } catch (err) {
      console.error("Erro ao excluir produto:", err);
    }
  };

  // ====================================================
  // 🧠 VIEW (layout idêntico ao de Fornecedores)
  // ====================================================
  return (
    <div className="flex flex-col h-full">
      {/* TOPO */}
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-2xl font-semibold">Produtos</h1>
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
            className={`px-4 py-2 rounded-lg flex items-center gap-2 ${
              selecionado
                ? "bg-blue-600 text-white hover:bg-blue-700"
                : "bg-gray-200 text-gray-500 cursor-not-allowed"
            }`}
          >
            <Edit3 size={18} /> Editar
          </button>
        </div>
      </div>

      {/* FILTROS */}
      <div className="mb-3 bg-white border border-gray-200 rounded-xl p-3 shadow-sm">
        <div className="grid grid-cols-6 gap-2">
          <input
            type="text"
            placeholder="ID"
            value={filtro.id}
            onChange={(e) => setFiltro({ ...filtro, id: e.target.value })}
            className="border rounded-lg px-3 py-2"
          />
          <input
            type="text"
            placeholder="Nome"
            value={filtro.nome}
            onChange={(e) => setFiltro({ ...filtro, nome: e.target.value })}
            className="border rounded-lg px-3 py-2 col-span-2"
          />
          <input
            type="text"
            placeholder="Grupo (nome)"
            value={filtro.grupo_nome}
            onChange={(e) => setFiltro({ ...filtro, grupo_nome: e.target.value })}
            className="border rounded-lg px-3 py-2 col-span-2"
          />
          <input
            type="text"
            placeholder="Fornecedor (nome)"
            value={filtro.fornecedor_nome}
            onChange={(e) => setFiltro({ ...filtro, fornecedor_nome: e.target.value })}
            className="border rounded-lg px-3 py-2 col-span-2"
          />
          <select
            value={filtro.grupo_id}
            onChange={(e) => setFiltro({ ...filtro, grupo_id: e.target.value })}
            className="border rounded-lg px-3 py-2"
          >
            <option value="">Grupo</option>
            {Array.isArray(grupos) && grupos.map((g) => (
              <option key={g.id} value={g.id}>{g.nome}</option>
            ))}
          </select>
          <select
            value={filtro.fornecedor_id}
            onChange={(e) => setFiltro({ ...filtro, fornecedor_id: e.target.value })}
            className="border rounded-lg px-3 py-2"
          >
            <option value="">Fornecedor</option>
            {Array.isArray(fornecedores) && fornecedores.map((f) => (
              <option key={f.id} value={f.id}>{f.nome_fantasia || f.razao_social || f.cnpj_cpf}</option>
            ))}
          </select>
          <div className="grid grid-cols-3 gap-2 col-span-6 lg:col-span-6">
            <select
              value={filtro.unidade}
              onChange={(e) => setFiltro({ ...filtro, unidade: e.target.value })}
              className="border rounded-lg px-3 py-2"
            >
              <option value="">Unidade</option>
              <option value="UN">UN</option>
              <option value="PC">PC</option>
              <option value="CX">CX</option>
              <option value="KG">KG</option>
              <option value="M">M</option>
              <option value="L">L</option>
            </select>
            <select
              value={filtro.status}
              onChange={(e) => setFiltro({ ...filtro, status: e.target.value })}
              className="border rounded-lg px-3 py-2"
            >
              <option value="todos">Todos</option>
              <option value="ativos">Ativos</option>
              <option value="inativos">Inativos</option>
            </select>
            <button
              onClick={() => setFiltro({ id: "", nome: "", grupo_nome: "", fornecedor_nome: "", grupo_id: "", fornecedor_id: "", unidade: "", status: "ativos" })}
              className="border rounded-lg px-3 py-2 hover:bg-gray-50"
            >
              Limpar filtros
            </button>
          </div>
        </div>
      </div>

      {/* TABELA */}
      <div className="flex-1 overflow-y-auto bg-white border border-gray-200 rounded-xl shadow-sm">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 text-gray-600">
            <tr>
              <th className="text-left px-4 py-3 font-medium" style={{ width: columnWidths.nome, minWidth: columnWidths.nome, position: 'relative' }}>
                Nome
                <span
                  onMouseDown={(e) => startResize(e, 'nome')}
                  style={{ position: 'absolute', right: 0, top: 0, width: 8, height: '100%', cursor: 'col-resize', userSelect: 'none' }}
                />
              </th>
              <th className="text-left px-4 py-3 font-medium" style={{ width: columnWidths.grupo, minWidth: columnWidths.grupo, position: 'relative' }}>
                Grupo
                <span
                  onMouseDown={(e) => startResize(e, 'grupo')}
                  style={{ position: 'absolute', right: 0, top: 0, width: 8, height: '100%', cursor: 'col-resize', userSelect: 'none' }}
                />
              </th>
              <th className="text-left px-4 py-3 font-medium" style={{ width: columnWidths.fornecedor, minWidth: columnWidths.fornecedor, position: 'relative' }}>
                Fornecedor
                <span
                  onMouseDown={(e) => startResize(e, 'fornecedor')}
                  style={{ position: 'absolute', right: 0, top: 0, width: 8, height: '100%', cursor: 'col-resize', userSelect: 'none' }}
                />
              </th>
              <th className="text-left px-4 py-3 font-medium" style={{ width: columnWidths.qtd, minWidth: columnWidths.qtd, position: 'relative' }}>
                Qtd
                <span
                  onMouseDown={(e) => startResize(e, 'qtd')}
                  style={{ position: 'absolute', right: 0, top: 0, width: 8, height: '100%', cursor: 'col-resize', userSelect: 'none' }}
                />
              </th>
              <th className="text-left px-4 py-3 font-medium" style={{ width: columnWidths.unid, minWidth: columnWidths.unid, position: 'relative' }}>
                Unid.
                <span
                  onMouseDown={(e) => startResize(e, 'unid')}
                  style={{ position: 'absolute', right: 0, top: 0, width: 8, height: '100%', cursor: 'col-resize', userSelect: 'none' }}
                />
              </th>
              <th className="text-left px-4 py-3 font-medium" style={{ width: columnWidths.compra, minWidth: columnWidths.compra, position: 'relative' }}>
                Compra
                <span
                  onMouseDown={(e) => startResize(e, 'compra')}
                  style={{ position: 'absolute', right: 0, top: 0, width: 8, height: '100%', cursor: 'col-resize', userSelect: 'none' }}
                />
              </th>
              <th className="text-left px-4 py-3 font-medium" style={{ width: columnWidths.venda, minWidth: columnWidths.venda, position: 'relative' }}>
                Venda
                <span
                  onMouseDown={(e) => startResize(e, 'venda')}
                  style={{ position: 'absolute', right: 0, top: 0, width: 8, height: '100%', cursor: 'col-resize', userSelect: 'none' }}
                />
              </th>
            </tr>
          </thead>
          <tbody>
            {produtosFiltrados.map((p) => (
              <tr
                key={p.id}
                onClick={() =>
                  setSelecionado(selecionado?.id === p.id ? null : p)
                }
                className={`cursor-pointer border-t hover:bg-blue-50 ${
                  selecionado?.id === p.id ? "bg-blue-100" : ""
                }`}
              >
                <td className="px-4 py-2" style={{ width: columnWidths.nome }}>{`${p.id} - ${p.nome}`}</td>
                <td className="px-4 py-2" style={{ width: columnWidths.grupo }}>{p.grupo_nome ?? "-"}</td>
                <td className="px-4 py-2" style={{ width: columnWidths.fornecedor }}>{p.fornecedor_nome ?? "-"}</td>
                <td className="px-4 py-2" style={{ width: columnWidths.qtd }}>{p.quantidade ?? "-"}</td>
                <td className="px-4 py-2" style={{ width: columnWidths.unid }}>{p.unidade_medida ?? "-"}</td>
                <td className="px-4 py-2" style={{ width: columnWidths.compra }}>
                  {p.valor_compra != null
                    ? formatCurrencyBR(Number(p.valor_compra), true)
                    : "-"}
                </td>
                <td className="px-4 py-2" style={{ width: columnWidths.venda }}>
                  {p.valor_venda != null
                    ? formatCurrencyBR(Number(p.valor_venda), true)
                    : "-"}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* MODAL */}
      {modalOpen && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl shadow-lg w-full max-w-5xl max-h-[90vh] overflow-y-auto p-6 relative">
            {/* Fechar */}
            <button
              onClick={fecharModal}
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-600"
            >
              <X size={20} />
            </button>

            {/* Excluir / Restaurar */}
            {modoEdicao && selecionado && (
              selecionado.status === 'inativo' ? (
                <button
                  onClick={async () => {
                    try {
                      await restaurarProduto(selecionado.id);
                      carregar();
                      setSelecionado(null);
                      fecharModal();
                    } catch (err) {
                      console.error('Erro ao restaurar produto:', err);
                    }
                  }}
                  className="absolute top-4 right-24 flex items-center gap-1 text-green-600 hover:text-green-700 text-sm font-medium"
                >
                  <Check size={16} /> Restaurar
                </button>
              ) : (
                <button
                  onClick={() => setConfirmarExclusao(true)}
                  className="absolute top-4 right-24 flex items-center gap-1 text-gray-500 hover:text-gray-700 text-sm font-medium"
                >
                  <Trash2 size={16} /> Excluir
                </button>
              )
            )}

            <h2 className="text-xl font-semibold mb-4">
              {modoEdicao ? "Editar Produto" : "Novo Produto"}
            </h2>

            {erro && (
              <div className="mb-3 rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
                {erro}
              </div>
            )}

            {/* FORMULÁRIO */}
            <div className="grid grid-cols-2 gap-3">
              <input
                type="text"
                placeholder="Nome *"
                value={form.nome}
                onChange={(e) => setForm({ ...form, nome: e.target.value })}
                className="col-span-2 border rounded-lg px-3 py-2"
              />

              <div className="flex gap-2">
                <div className="flex-1">
                  <label className="text-xs text-gray-600">Unidade *</label>
                  <select
                    value={form.unidade_medida}
                    onChange={(e) =>
                      setForm({ ...form, unidade_medida: e.target.value })
                    }
                    className="w-full border rounded-lg px-3 py-2"
                  >
                    <option value="UN">UN</option>
                    <option value="PC">PC</option>
                    <option value="CX">CX</option>
                    <option value="KG">KG</option>
                    <option value="M">M</option>
                    <option value="L">L</option>
                  </select>
                </div>

                <div className="flex-1">
                  <label className="text-xs text-gray-600">Quantidade *</label>
                  <input
                    type="number"
                    placeholder="0"
                    value={form.quantidade}
                    onChange={(e) =>
                      setForm({ ...form, quantidade: e.target.value })
                    }
                    className="w-full border rounded-lg px-3 py-2"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs text-gray-600">Valor de Compra</label>
                <MoneyInput
                  className="border rounded-lg px-3 py-2 w-full"
                  value={form.valor_compra}
                  onValueChange={(v) => setForm({ ...form, valor_compra: v })}
                  placeholder="R$ 0,00"
                />
              </div>

              <div>
                <label className="text-xs text-gray-600">Valor de Venda *</label>
                <MoneyInput
                  className="border rounded-lg px-3 py-2 w-full"
                  value={form.valor_venda}
                  onValueChange={(v) => setForm({ ...form, valor_venda: v })}
                  placeholder="R$ 0,00"
                />
              </div>

              {/* Campo Grupo */}
              <div>
                <label className="text-xs text-gray-600">Grupo *</label>
                <select
                  value={form.grupo_id}
                  onChange={(e) =>
                    setForm({ ...form, grupo_id: e.target.value })
                  }
                  className="border rounded-lg px-3 py-2 w-full"
                >
                  <option value="">Selecione um grupo...</option>
                  {Array.isArray(grupos) &&
                    grupos.map((g) => (
                      <option key={g.id} value={g.id}>
                        {g.nome}
                      </option>
                    ))}
                </select>
              </div>

              <div>
                <label className="text-xs text-gray-600">Fornecedor</label>
                <select
                  value={form.fornecedor_id}
                  onChange={(e) =>
                    setForm({ ...form, fornecedor_id: e.target.value })
                  }
                  className="border rounded-lg px-3 py-2 w-full"
                >
                  <option value="">Selecione um fornecedor...</option>
                  {Array.isArray(fornecedores) &&
                    fornecedores.map((f) => (
                      <option key={f.id} value={f.id}>
                        {f.nome_fantasia || f.razao_social || f.cnpj_cpf}
                      </option>
                    ))}
                </select>
              </div>

              <div className="col-span-2">
                <label className="text-xs text-gray-600">Número da Nota</label>
                <input
                  type="text"
                  placeholder="Ex.: 12345"
                  value={form.numero_nota}
                  onChange={(e) =>
                    setForm({ ...form, numero_nota: e.target.value })
                  }
                  className="border rounded-lg px-3 py-2 w-full"
                />
              </div>
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
                className={`px-4 py-2 rounded-lg text-white ${
                  camposValidos()
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
              Tem certeza que deseja excluir o produto{" "}
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
