import { useEffect, useState } from "react";
import { Plus, Edit3, Trash2, X, Loader2, Search, AlertTriangle } from "lucide-react";
import fornecedorService from "../services/fornecedorService";

// ====================================================
// 🧩 Funções auxiliares de validação
// ====================================================
function validarCNPJ(cnpj) {
    cnpj = cnpj.replace(/[^\d]+/g, "");
    if (cnpj.length !== 14) return false;
    if (/^(\d)\1+$/.test(cnpj)) return false;
    let tamanho = cnpj.length - 2;
    let numeros = cnpj.substring(0, tamanho);
    let digitos = cnpj.substring(tamanho);
    let soma = 0;
    let pos = tamanho - 7;
    for (let i = tamanho; i >= 1; i--) {
        soma += numeros.charAt(tamanho - i) * pos--;
        if (pos < 2) pos = 9;
    }
    let resultado = soma % 11 < 2 ? 0 : 11 - (soma % 11);
    if (resultado != digitos.charAt(0)) return false;
    tamanho++;
    numeros = cnpj.substring(0, tamanho);
    soma = 0;
    pos = tamanho - 7;
    for (let i = tamanho; i >= 1; i--) {
        soma += numeros.charAt(tamanho - i) * pos--;
        if (pos < 2) pos = 9;
    }
    resultado = soma % 11 < 2 ? 0 : 11 - (soma % 11);
    return resultado == digitos.charAt(1);
}

function validarCPF(cpf) {
    cpf = cpf.replace(/[^\d]+/g, "");
    if (cpf.length !== 11 || /^(\d)\1+$/.test(cpf)) return false;
    let soma = 0;
    for (let i = 0; i < 9; i++) soma += parseInt(cpf.charAt(i)) * (10 - i);
    let resto = 11 - (soma % 11);
    if (resto === 10 || resto === 11) resto = 0;
    if (resto !== parseInt(cpf.charAt(9))) return false;
    soma = 0;
    for (let i = 0; i < 10; i++) soma += parseInt(cpf.charAt(i)) * (11 - i);
    resto = 11 - (soma % 11);
    if (resto === 10 || resto === 11) resto = 0;
    return resto === parseInt(cpf.charAt(10));
}

const UFs = [
    "AC", "AL", "AP", "AM", "BA", "CE", "DF", "ES", "GO", "MA", "MT", "MS", "MG",
    "PA", "PB", "PR", "PE", "PI", "RJ", "RN", "RS", "RO", "RR", "SC", "SP", "SE", "TO"
];

// ====================================================
// 🔎 Buscar dados do CNPJ (API publica.cnpj.ws)
// ====================================================
async function buscarCNPJ(cnpj) {
    try {
        const numero = cnpj.replace(/[^\d]+/g, "");
        if (numero.length !== 14) return null;

        const resposta = await fetch(`https://publica.cnpj.ws/cnpj/${numero}`);
        if (!resposta.ok) throw new Error("Erro na requisição da API");
        const dados = await resposta.json();

        const info = dados.estabelecimento || {};
        const empresa = dados.razao_social || "";

        return {
            razao_social: empresa || "",
            nome_fantasia: info.nome_fantasia || "",
            cep: info.cep || "",
            rua: info.logradouro || "",
            numero: info.numero || "",
            bairro: info.bairro || "",
            cidade: info.cidade?.nome || "",
            estado: info.estado?.sigla || "",
            telefone: info.telefone1 || "",
            email: info.email || "",
        };
    } catch (err) {
        console.error("Erro ao consultar CNPJ:", err);
        alert("Erro ao consultar CNPJ. Tente novamente mais tarde.");
        return null;
    }
}

// ====================================================
// 📄 COMPONENTE PRINCIPAL
// ====================================================
export default function Fornecedores() {
    const [fornecedores, setFornecedores] = useState([]);
    const [selecionado, setSelecionado] = useState(null);
    const [modalOpen, setModalOpen] = useState(false);
    const [modoEdicao, setModoEdicao] = useState(false);
    const [saving, setSaving] = useState(false);
    const [erro, setErro] = useState("");
    const [confirmarExclusao, setConfirmarExclusao] = useState(false);

    const [form, setForm] = useState({
        tipo_pessoa: "J",
        razao_social: "",
        nome_fantasia: "",
        cnpj_cpf: "",
        bairro: "",
        numero: "",
        cidade: "",
        estado: "",
        telefone: "",
        email: "",
    });

    // ====================================================
    // 🔄 CARREGAR LISTA
    // ====================================================
    const carregar = async () => {
        try {
            const lista = await fornecedorService.listarFornecedores();
            const ordenada = [...lista].sort((a, b) =>
                (a.razao_social || "").localeCompare(b.razao_social || "")
            );
            setFornecedores(ordenada);
        } catch (err) {
            console.error("Erro ao carregar fornecedores:", err);
        }
    };

    useEffect(() => {
        carregar();
    }, []);

    // ====================================================
    // 🧾 ABRIR / FECHAR MODAL
    // ====================================================
    const abrirModal = (modo = "novo") => {
        setModoEdicao(modo === "editar");
        setErro("");

        if (modo === "editar" && selecionado) {
            setForm({ ...selecionado });
        } else {
            setForm({
                tipo_pessoa: "J",
                razao_social: "",
                nome_fantasia: "",
                cnpj_cpf: "",
                bairro: "",
                numero: "",
                cidade: "",
                estado: "",
                telefone: "",
                email: "",
            });
        }
        setModalOpen(true);
    };

    const fecharModal = () => {
        setModalOpen(false);
        setConfirmarExclusao(false);
        setErro("");
    };

    // ====================================================
    // 💾 SALVAR
    // ====================================================
    const camposValidos = () => {
        const {
            razao_social,
            nome_fantasia,
            cnpj_cpf,
            cidade,
            estado,
            bairro,
            numero,
            telefone,
            email,
            tipo_pessoa,
        } = form;

        if (
            !razao_social?.trim() ||
            !nome_fantasia?.trim() ||
            !cnpj_cpf?.trim() ||
            !cidade?.trim() ||
            !estado?.trim() ||
            !bairro?.trim() ||
            !numero?.trim() ||
            !telefone?.trim() ||
            !email?.trim()
        )
            return false;

        if (tipo_pessoa === "J" && !validarCNPJ(cnpj_cpf)) return false;
        if (tipo_pessoa === "F" && !validarCPF(cnpj_cpf)) return false;

        return true;
    };

    const salvar = async () => {
        if (!camposValidos()) {
            setErro("Preencha todos os campos obrigatórios corretamente.");
            return;
        }

        try {
            setSaving(true);
            if (modoEdicao && selecionado) {
                await fornecedorService.atualizarFornecedor(selecionado.id, form);
            } else {
                await fornecedorService.criarFornecedor(form);
            }
            fecharModal();
            carregar();
        } catch (err) {
            console.error("Erro ao salvar fornecedor:", err);
            setErro(err?.response?.data?.erro || "Erro ao salvar fornecedor.");
        } finally {
            setSaving(false);
        }
    };

    // ====================================================
    // 🗑️ EXCLUIR
    // ====================================================
    const excluir = async () => {
        try {
            await fornecedorService.excluirFornecedor(selecionado.id);
            setSelecionado(null);
            carregar();
            fecharModal();
        } catch (err) {
            console.error("Erro ao excluir fornecedor:", err);
        }
    };

    // ====================================================
    // 🧠 VIEW
    // ====================================================
    return (
        <div className="flex flex-col h-full">
            {/* TOPO */}
            <div className="flex items-center justify-between mb-4">
                <h1 className="text-2xl font-semibold">Fornecedores</h1>
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
                        className={`px-4 py-2 rounded-lg flex items-center gap-2 ${selecionado
                                ? "bg-blue-600 text-white hover:bg-blue-700"
                                : "bg-gray-200 text-gray-500 cursor-not-allowed"
                            }`}
                    >
                        <Edit3 size={18} /> Editar
                    </button>
                </div>
            </div>

            {/* TABELA */}
            <div className="flex-1 overflow-y-auto bg-white border border-gray-200 rounded-xl shadow-sm">
                <table className="w-full text-sm">
                    <thead className="bg-gray-50 text-gray-600">
                        <tr>
                            <th className="text-left px-4 py-3 font-medium">
                                Nome / Razão Social
                            </th>
                            <th className="text-left px-4 py-3 font-medium">Fantasia</th>
                            <th className="text-left px-4 py-3 font-medium">CPF/CNPJ</th>
                            <th className="text-left px-4 py-3 font-medium">Cidade</th>
                            <th className="text-left px-4 py-3 font-medium">UF</th>
                            <th className="text-left px-4 py-3 font-medium">Telefone</th>
                        </tr>
                    </thead>
                    <tbody>
                        {fornecedores.map((f) => (
                            <tr
                                key={f.id}
                                onClick={() =>
                                    setSelecionado(selecionado?.id === f.id ? null : f)
                                }
                                className={`cursor-pointer border-t hover:bg-blue-50 ${selecionado?.id === f.id ? "bg-blue-100" : ""
                                    }`}
                            >
                                <td className="px-4 py-2">{f.razao_social}</td>
                                <td className="px-4 py-2">{f.nome_fantasia}</td>
                                <td className="px-4 py-2">{f.cnpj_cpf}</td>
                                <td className="px-4 py-2">{f.cidade}</td>
                                <td className="px-4 py-2">{f.estado}</td>
                                <td className="px-4 py-2">{f.telefone}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {/* MODAL */}
            {modalOpen && (
                <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
                    <div className="bg-white rounded-2xl shadow-lg w-full max-w-5xl max-h-[90vh] overflow-y-auto p-6 relative">
                        <button
                            onClick={fecharModal}
                            className="absolute top-4 right-4 text-gray-400 hover:text-gray-600"
                        >
                            <X size={20} />
                        </button>

                        {modoEdicao && (
                            <button
                                onClick={() => setConfirmarExclusao(true)}
                                className="absolute top-4 right-24 flex items-center gap-1 text-gray-500 hover:text-gray-700 text-sm font-medium"
                            >
                                <Trash2 size={16} /> Excluir
                            </button>
                        )}

                        <h2 className="text-xl font-semibold mb-4">
                            {modoEdicao ? "Editar Fornecedor" : "Novo Fornecedor"}
                        </h2>

                        {erro && (
                            <div className="mb-3 rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
                                {erro}
                            </div>
                        )}

                        {/* FORMULÁRIO */}
                        <div className="grid grid-cols-2 gap-3">
                            <select
                                value={form.tipo_pessoa}
                                onChange={(e) =>
                                    setForm({ ...form, tipo_pessoa: e.target.value })
                                }
                                className="border rounded-lg px-3 py-2"
                            >
                                <option value="J">Pessoa Jurídica</option>
                                <option value="F">Pessoa Física</option>
                            </select>

                            <div className="flex gap-2">
                                <input
                                    type="text"
                                    placeholder={
                                        form.tipo_pessoa === "J" ? "CNPJ" : "CPF"
                                    }
                                    value={form.cnpj_cpf}
                                    onChange={(e) =>
                                        setForm({ ...form, cnpj_cpf: e.target.value })
                                    }
                                    className="border rounded-lg px-3 py-2 flex-1"
                                />
                                {form.tipo_pessoa === "J" && (
                                    <button
                                        type="button"
                                        onClick={async () => {
                                            if (!validarCNPJ(form.cnpj_cpf)) {
                                                alert("CNPJ inválido.");
                                                return;
                                            }
                                            const info = await buscarCNPJ(form.cnpj_cpf);
                                            if (info) setForm({ ...form, ...info });
                                        }}
                                        className="bg-blue-600 text-white px-3 rounded-lg hover:bg-blue-700 flex items-center justify-center"
                                    >
                                        <Search size={16} />
                                    </button>
                                )}
                            </div>

                            <input
                                type="text"
                                placeholder={
                                    form.tipo_pessoa === "J"
                                        ? "Razão Social"
                                        : "Nome Completo"
                                }
                                value={form.razao_social}
                                onChange={(e) =>
                                    setForm({ ...form, razao_social: e.target.value })
                                }
                                className="col-span-2 border rounded-lg px-3 py-2"
                            />

                            <input
                                type="text"
                                placeholder="Nome Fantasia"
                                value={form.nome_fantasia}
                                onChange={(e) =>
                                    setForm({ ...form, nome_fantasia: e.target.value })
                                }
                                className="col-span-2 border rounded-lg px-3 py-2"
                            />

                            <input
                                type="text"
                                placeholder="Cidade"
                                value={form.cidade}
                                onChange={(e) =>
                                    setForm({ ...form, cidade: e.target.value })
                                }
                                className="border rounded-lg px-3 py-2"
                            />

                            <select
                                value={form.estado}
                                onChange={(e) =>
                                    setForm({ ...form, estado: e.target.value })
                                }
                                className="border rounded-lg px-3 py-2"
                            >
                                <option value="">Selecione UF</option>
                                {UFs.map((uf) => (
                                    <option key={uf} value={uf}>
                                        {uf}
                                    </option>
                                ))}
                            </select>

                            <input
                                type="text"
                                placeholder="Bairro"
                                value={form.bairro}
                                onChange={(e) =>
                                    setForm({ ...form, bairro: e.target.value })
                                }
                                className="border rounded-lg px-3 py-2"
                            />

                            <input
                                type="text"
                                placeholder="Número"
                                value={form.numero}
                                onChange={(e) =>
                                    setForm({ ...form, numero: e.target.value })
                                }
                                className="border rounded-lg px-3 py-2"
                            />

                            <input
                                type="text"
                                placeholder="Telefone"
                                value={form.telefone}
                                onChange={(e) =>
                                    setForm({ ...form, telefone: e.target.value })
                                }
                                className="border rounded-lg px-3 py-2"
                            />

                            <input
                                type="email"
                                placeholder="Email"
                                value={form.email}
                                onChange={(e) =>
                                    setForm({ ...form, email: e.target.value })
                                }
                                className="border rounded-lg px-3 py-2"
                            />
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
                                className={`px-4 py-2 rounded-lg text-white ${camposValidos()
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
                        <div className="flex items-center gap-3 mb-3">
                            <AlertTriangle className="text-red-600" size={22} />
                            <h3 className="text-lg font-semibold">Confirmar exclusão</h3>
                        </div>
                        <p className="text-gray-700 mb-6">
                            Tem certeza que deseja excluir o fornecedor{" "}
                            <strong>{selecionado?.razao_social}</strong>?
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
