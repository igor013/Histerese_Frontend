// src/services/empresaService.js
import api from "./api";

/**
 * ==============================================
 * 🏢 SERVICE: EMPRESAS
 * ==============================================
 * Centraliza todas as chamadas relacionadas
 * ao módulo de empresas no backend.
 * Baseado em `api.js`, que já contém:
 *   - baseURL: http://localhost:4000/api
 *   - interceptador de token JWT automático
 * ==============================================
 */

// 📋 LISTAR EMPRESAS (com filtro opcional)
export async function listarEmpresas(filtro = "") {
    try {
        const response = await api.get("/empresas", { params: { filtro } });
        return response.data;
    } catch (err) {
        console.error("Erro ao listar empresas:", err);
        throw err;
    }
}

// 🔍 BUSCAR EMPRESA POR ID
export async function buscarEmpresaPorId(id) {
    try {
        const response = await api.get(`/empresas/${id}`);
        return response.data;
    } catch (err) {
        console.error("Erro ao buscar empresa:", err);
        throw err;
    }
}

// ✏️ ATUALIZAR EMPRESA
export async function atualizarEmpresa(id, dados) {
    try {
        const response = await api.put(`/empresas/${id}`, dados);
        return response.data;
    } catch (err) {
        console.error("Erro ao atualizar empresa:", err);
        throw err;
    }
}

// 🗑️ EXCLUIR EMPRESA (exclusão lógica)
export async function excluirEmpresa(id) {
    try {
        const response = await api.delete(`/empresas/${id}`);
        return response.data;
    } catch (err) {
        console.error("Erro ao excluir empresa:", err);
        throw err;
    }
}
