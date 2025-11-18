import api from "./api";

// ====================================================
// 🧾 Service: NOTAS FISCAIS
// ====================================================

// 📋 Listar notas fiscais
export async function listarNotas({ page = 1, limit = 100, q = "" } = {}) {
  const params = new URLSearchParams();
  params.set("page", page);
  params.set("limit", limit);
  if (q) params.set("q", q);

  const { data } = await api.get(`/notas?${params.toString()}`);
  return data; // pode ser array direto ou { items: [...] }
}

// 🔎 Buscar nota (cabeçalho + itens)
export async function buscarNota(id) {
  const { data } = await api.get(`/notas/${id}`);
  return data; // { id, numero, ..., itens: [...] }
}

// ➕ Criar nota fiscal (aceita itens)
export async function criarNota(payload) {
  const { data } = await api.post("/notas", payload);
  return data;
}

// ✏️ Atualizar nota fiscal (cabeçalho)
export async function atualizarNota(id, payload) {
  const { data } = await api.put(`/notas/${id}`, payload);
  return data;
}

// 🗑️ Excluir nota fiscal
export async function excluirNota(id) {
  const { data } = await api.delete(`/notas/${id}`);
  return data;
}

// 📤 Importar XML de nota fiscal
export async function importarXML(file) {
  const form = new FormData();
  // Backend espera o campo 'file'
  form.append("file", file);
  const { data } = await api.post("/notas/import/xml", form, {
    headers: { "Content-Type": "multipart/form-data" },
  });
  return data; // { status: 'imported'|'skipped', access_key? }
}

// ====================================================
// 🧾 Itens da Nota (para modo edição de nota existente)
// ====================================================

export async function adicionarItem(notaId, item) {
  // item = { produto_id, quantidade, unidade_medida, valor_unitario }
  const { data } = await api.post(`/notas/${notaId}/itens`, item);
  return data;
}

export async function editarItem(itemId, item) {
  // item = { produto_id?, quantidade?, unidade_medida?, valor_unitario? }
  const { data } = await api.put(`/notas/itens/${itemId}`, item);
  return data;
}

export async function excluirItem(itemId) {
  const { data } = await api.delete(`/notas/itens/${itemId}`);
  return data;
}
