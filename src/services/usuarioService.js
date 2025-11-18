// src/services/usuarioService.js
import api from "./api";

/**
 * ==============================================
 * 👤 SERVICE: USUÁRIOS
 * ==============================================
 * Este arquivo centraliza todas as chamadas
 * relacionadas à tabela de usuários no backend.
 * Baseado em `api.js`, que já contém:
 *   - baseURL: http://localhost:4000/api
 *   - interceptador de token JWT automático
 * ==============================================
 */

// 📋 LISTAR USUÁRIOS (com filtro opcional)
export async function listarUsuarios(filtro = "") {
    try {
        const response = await api.get("/usuarios", { params: { filtro } });
        return response.data;
    } catch (err) {
        console.error("Erro ao listar usuários:", err);
        throw err;
    }
}

// 🔍 BUSCAR USUÁRIO POR ID
export async function buscarUsuarioPorId(id) {
    try {
        const response = await api.get(`/usuarios/${id}`);
        return response.data;
    } catch (err) {
        console.error("Erro ao buscar usuário:", err);
        throw err;
    }
}

// ➕ CRIAR NOVO USUÁRIO
export async function criarUsuario(dados) {
    try {
        const response = await api.post("/usuarios", dados);
        return response.data;
    } catch (err) {
        console.error("Erro ao criar usuário:", err);
        throw err;
    }
}

// ✏️ ATUALIZAR USUÁRIO
export async function atualizarUsuario(id, dados) {
    try {
        const response = await api.put(`/usuarios/${id}`, dados);
        return response.data;
    } catch (err) {
        console.error("Erro ao atualizar usuário:", err);
        throw err;
    }
}

// 🔑 ATUALIZAR SENHA DO USUÁRIO
export async function atualizarSenha(id, senhaAtual, novaSenha) {
    try {
        const response = await api.put(`/usuarios/${id}/senha`, {
            senhaAtual,
            novaSenha,
        });
        return response.data;
    } catch (err) {
        console.error("Erro ao atualizar senha:", err);
        throw err;
    }
}

// 🗑️ EXCLUIR USUÁRIO (exclusão lógica)
export async function excluirUsuario(id) {
    try {
        const response = await api.delete(`/usuarios/${id}`);
        return response.data;
    } catch (err) {
        console.error("Erro ao excluir usuário:", err);
        throw err;
    }
}

// 🔐 LOGIN (para uso no AuthContext)
export async function loginUsuario({ login, senha, empresa_id }) {
    try {
        const response = await api.post("/usuarios/login", {
            login,
            senha,
            empresa_id,
        });
        return response.data;
    } catch (err) {
        console.error("Erro ao realizar login:", err);
        throw err;
    }
}
