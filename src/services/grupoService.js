import api from "./api";

// ====================================================
// 📦 Service de Grupos (padronizado)
// ====================================================

// Lista grupos com paginação opcional
export const listarGrupos = async (params = {}) => {
  const { page = 1, limit = 50, q = "" } = params;
  const res = await api.get("/grupos", { params: { page, limit, q } });
  return res.data; // backend geralmente retorna { items: [...] }
};

// Cria novo grupo
export const criarGrupo = async (dados) => {
  const res = await api.post("/grupos", dados);
  return res.data;
};

// Atualiza grupo
export const atualizarGrupo = async (id, dados) => {
  const res = await api.put(`/grupos/${id}`, dados);
  return res.data;
};

// Exclui (lógica ou física)
export const excluirGrupo = async (id) => {
  const res = await api.delete(`/grupos/${id}`);
  return res.data;
};
