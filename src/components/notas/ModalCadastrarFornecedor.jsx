// src/components/notas/ModalCadastrarFornecedor.jsx
import { useEffect, useState } from "react";
import { X } from "lucide-react";
import { criarFornecedor } from "../../services/fornecedorService";

export default function ModalCadastrarFornecedor({
    open,
    onClose,
    onSaved,
    dadosImportados
}) {

    const [form, setForm] = useState({
        tipo_pessoa: "J",
        razao_social: "",
        nome_fantasia: "",
        cnpj: "",
        ie: "",
        rua: "",
        numero: "",
        bairro: "",
        cidade: "",
        uf: "",
        cep: "",
        telefone: "",
        email: "",
    });

    const [salvando, setSalvando] = useState(false);

    // -----------------------------------------------------------
    // PREENCHE AUTOMATICAMENTE PELOS DADOS DO XML
    // -----------------------------------------------------------
    useEffect(() => {
        if (!open) return;

        if (dadosImportados) {
            setForm((f) => ({
                ...f,
                razao_social: dadosImportados.razao_social || "",
                nome_fantasia: dadosImportados.razao_social || "",
                cnpj: dadosImportados.cnpj || "",
                ie: dadosImportados.ie || "",
                rua: dadosImportados.rua || "",
                numero: dadosImportados.numero || "",
                bairro: dadosImportados.bairro || "",
                cidade: dadosImportados.cidade || "",
                uf: (dadosImportados.uf || "").toUpperCase(),
                cep: dadosImportados.cep || "",
                telefone: dadosImportados.telefone || "",
                email: dadosImportados.email || "",
            }));
        }

    }, [dadosImportados, open]);

    // -----------------------------------------------------------
    // SALVAR FORNECEDOR
    // -----------------------------------------------------------
    async function salvar() {
        try {
            setSalvando(true);

            const payload = {
                tipo_pessoa: "J",
                nome: form.razao_social,
                razao_social: form.razao_social,
                nome_fantasia: form.nome_fantasia,
                cpf_cnpj: form.cnpj,
                cnpj: form.cnpj,
                inscricao_estadual: form.ie,
                rua: form.rua,
                numero: form.numero,
                bairro: form.bairro,
                cidade: form.cidade,
                uf: form.uf,
                cep: form.cep,
                telefone: form.telefone,
                email: form.email,
            };

            const fornecedor = await criarFornecedor(payload);

            if (onSaved) onSaved(fornecedor.id);
            onClose();

        } catch (err) {
            console.error(err);
            alert("Erro ao cadastrar fornecedor.");
        } finally {
            setSalvando(false);
        }
    }

    if (!open) return null;

    return (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-[999]">
            <div className="bg-white w-[900px] max-h-[90vh] rounded-xl shadow-lg flex flex-col">

                {/* Cabeçalho */}
                <div className="flex items-center justify-between p-4 border-b">
                    <h2 className="text-xl font-semibold">Cadastrar Fornecedor</h2>

                    <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
                        <X size={22} />
                    </button>
                </div>

                {/* Conteúdo */}
                <div className="p-4 overflow-y-auto">

                    <div className="grid grid-cols-2 gap-4">

                        {/* Razão social */}
                        <div className="col-span-2">
                            <label className="block text-sm mb-1">Razão Social</label>
                            <input
                                type="text"
                                className="w-full border rounded px-3 py-2"
                                value={form.razao_social}
                                onChange={(e) => setForm({ ...form, razao_social: e.target.value })}
                            />
                        </div>

                        {/* Nome fantasia */}
                        <div className="col-span-2">
                            <label className="block text-sm mb-1">Nome Fantasia</label>
                            <input
                                type="text"
                                className="w-full border rounded px-3 py-2"
                                value={form.nome_fantasia}
                                onChange={(e) => setForm({ ...form, nome_fantasia: e.target.value })}
                            />
                        </div>

                        {/* CNPJ */}
                        <div>
                            <label className="block text-sm mb-1">CNPJ</label>
                            <input
                                type="text"
                                className="w-full border rounded px-3 py-2"
                                value={form.cnpj}
                                onChange={(e) => setForm({ ...form, cnpj: e.target.value })}
                            />
                        </div>

                        {/* IE */}
                        <div>
                            <label className="block text-sm mb-1">Inscrição Estadual</label>
                            <input
                                type="text"
                                className="w-full border rounded px-3 py-2"
                                value={form.ie}
                                onChange={(e) => setForm({ ...form, ie: e.target.value })}
                            />
                        </div>

                        {/* Rua */}
                        <div className="col-span-2">
                            <label className="block text-sm mb-1">Rua</label>
                            <input
                                type="text"
                                className="w-full border rounded px-3 py-2"
                                value={form.rua}
                                onChange={(e) => setForm({ ...form, rua: e.target.value })}
                            />
                        </div>

                        {/* Número */}
                        <div>
                            <label className="block text-sm mb-1">Número</label>
                            <input
                                type="text"
                                className="w-full border rounded px-3 py-2"
                                value={form.numero}
                                onChange={(e) => setForm({ ...form, numero: e.target.value })}
                            />
                        </div>

                        {/* Bairro */}
                        <div>
                            <label className="block text-sm mb-1">Bairro</label>
                            <input
                                type="text"
                                className="w-full border rounded px-3 py-2"
                                value={form.bairro}
                                onChange={(e) => setForm({ ...form, bairro: e.target.value })}
                            />
                        </div>

                        {/* Cidade */}
                        <div>
                            <label className="block text-sm mb-1">Cidade</label>
                            <input
                                type="text"
                                className="w-full border rounded px-3 py-2"
                                value={form.cidade}
                                onChange={(e) => setForm({ ...form, cidade: e.target.value })}
                            />
                        </div>

                        {/* UF */}
                        <div>
                            <label className="block text-sm mb-1">UF</label>
                            <input
                                type="text"
                                maxLength={2}
                                className="w-full border rounded px-3 py-2 uppercase"
                                value={form.uf}
                                onChange={(e) => setForm({ ...form, uf: e.target.value.toUpperCase() })}
                            />
                        </div>

                        {/* CEP */}
                        <div>
                            <label className="block text-sm mb-1">CEP</label>
                            <input
                                type="text"
                                className="w-full border rounded px-3 py-2"
                                value={form.cep}
                                onChange={(e) => setForm({ ...form, cep: e.target.value })}
                            />
                        </div>

                        {/* Telefone */}
                        <div>
                            <label className="block text-sm mb-1">Telefone</label>
                            <input
                                type="text"
                                className="w-full border rounded px-3 py-2"
                                value={form.telefone}
                                onChange={(e) => setForm({ ...form, telefone: e.target.value })}
                            />
                        </div>

                        {/* Email */}
                        <div className="col-span-2">
                            <label className="block text-sm mb-1">E-mail</label>
                            <input
                                type="email"
                                className="w-full border rounded px-3 py-2"
                                value={form.email}
                                onChange={(e) => setForm({ ...form, email: e.target.value })}
                            />
                        </div>

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
                        disabled={salvando}
                        className="bg-green-600 hover:bg-green-700 text-white px-6 py-2 rounded"
                    >
                        {salvando ? "Salvando..." : "Salvar"}
                    </button>

                </div>
            </div>
        </div>
    );
}
