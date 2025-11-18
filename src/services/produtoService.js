import api from "./api";

export async function listarProdutos({ page = 1, limit = 20, q = "", status = "ativo" } = {}) {
  const params = new URLSearchParams();
  params.set("page", String(page));
  params.set("limit", String(limit));
  if (q) params.set("q", q);
  if (status) params.set("status", status);
  const { data } = await api.get(`/produtos?${params.toString()}`);
  return data;
}

export async function criarProduto(payload) {
  const { data } = await api.post("/produtos", payload);
  return data;
}

export async function atualizarProduto(id, payload) {
  const { data } = await api.put(`/produtos/${id}`, payload);
  return data;
}

export async function excluirProduto(id) {
  const { data } = await api.delete(`/produtos/${id}`);
  return data;
}

export async function buscarProdutoPorId(id) {
  const { data } = await api.get(`/produtos/${id}`);
  return data;
}

export async function restaurarProduto(id) {
  const { data } = await api.put(`/produtos/${id}/restaurar`);
  return data;
}
