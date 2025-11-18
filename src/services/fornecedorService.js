import api from "./api";

export const listarFornecedores = async () => {
    const res = await api.get("/fornecedores");
    return res.data;
};

export const criarFornecedor = async (dados) => {
    const res = await api.post("/fornecedores", dados);
    return res.data;
};

export const atualizarFornecedor = async (id, dados) => {
    const res = await api.put(`/fornecedores/${id}`, dados);
    return res.data;
};

export const excluirFornecedor = async (id) => {
    const res = await api.delete(`/fornecedores/${id}`);
    return res.data;
};

export const buscarFornecedorPorId = async (id) => {
    const res = await api.get(`/fornecedores/${id}`);
    return res.data;
};

export default {
    listarFornecedores,
    criarFornecedor,
    atualizarFornecedor,
    excluirFornecedor,
    buscarFornecedorPorId,
};
