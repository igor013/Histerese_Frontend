// src/services/clienteService.js
import api from "./api.js";

const clienteService = {
    listar: async (page = 1, q = "") => {
        const response = await api.get(`/clientes?page=${page}&q=${q}`);
        return response.data;
    },

    criar: async (data) => {
        const response = await api.post("/clientes", data);
        return response.data;
    },

    atualizar: async (id, data) => {
        const response = await api.put(`/clientes/${id}`, data);
        return response.data;
    },

    excluir: async (id) => {
        const response = await api.delete(`/clientes/${id}`);
        return response.data;
    },

    restaurar: async (id) => {
        const response = await api.post(`/clientes/${id}/restaurar`);
        return response.data;
    },
};

export default clienteService;
