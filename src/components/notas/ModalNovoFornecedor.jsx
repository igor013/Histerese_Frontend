// src/components/notas/ModalNovoFornecedor.jsx
import { useEffect, useState } from "react";
import { X } from "lucide-react";
import { criarFornecedor } from "../../services/fornecedorService";

export default function ModalNovoFornecedor({ open, onClose, onCreated }) {

    const [tipo, setTipo] = useState("J"); // PJ padrão

    const [form, setForm] = useState({
        nome: "",
        cpf_cnpj: "",
        telefone: "",
        email: "",
        rua: "",
        numero: "",
        bairro: "",
        cidade: "",
        uf: "",
        complemento: ""
    });

    const [salvando, setSalvando] = useState(false);

    useEffect(() => {
        if (!open) return;

        // Reset ao abrir
        setTipo("J");
        setForm({
            nome: "",
            cpf_cnpj: "",
            telefone: "",
            email: "",
            rua: "",
            numero: "",
            bairro: "",
            cidade: "",
            uf: "",
            complemento: ""
        });

    }, [open]);

    function alterarTipo(novo) {
        setTipo(novo);
        setForm({ ...form, cpf_cnpj: "" });
    }

    async function salvar() {
        if (!form.nome || !form.cpf_cnpj) {
            alert("Nome e CPF/CNPJ são obrigatórios.");
            return;
        }

        const payload = {
            nome: form.nome,
            tipo_pessoa: tipo,
            cpf_cnpj: form.cpf_cnpj,
            telefone: form.telefone || null,
            email: form.email || null,
            rua: form.rua || null,
            numero: form.numero || null,
            bairro: form.bairro || null,
            cidade: form.cidade || null,
            uf: form.uf || null,
            complemento: form.complemento || null,
        };

        try {
            setSalvando(true);

            const novo = await criarFornecedor(payload);

            if (onCreated) onCreated(novo);

            onClose();
        } catch (err) {
            console.error("Erro ao criar fornecedor:", err);
            alert("Erro ao criar fornecedor.");
        } finally {
            setSalvando(false);
        }
    }

    if (!open) return null;

    return (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-[70]">
            <div className="bg-white w-[650px] max-h-[85vh] rounded-lg shadow-lg flex flex-col">

                {/* Cabeçalho */}
                <div className="flex items-center justify-between p-4 border-b">
                    <h2 className="text-lg font-semibold">Novo Fornecedor</h2>

                    <button
                        onClick={onClose}
                        className="text-gray-600 hover:text-gray-800"
                    >
                        <X size={22} />
                    </button>
                </div>

                {/* Conteúdo */}
                <div className="p-4 overflow-y-auto">

                    {/* TIPO PESSOA */}
                    <div className="flex gap-4 mb-4">
                        <label className="flex items-center gap-2">
                            <input
                                type="radio"
                                checked={tipo === "J"}
                                onChange={() => alterarTipo("J")}
                            />
                            PJ
                        </label>

                        <label className="flex items-center gap-2">
                            <input
                                type="radio"
                                checked={tipo === "F"}
                                onChange={() => alterarTipo("F")}
                            />
                            PF
                        </label>
                    </div>

                    <div className="grid grid-cols-2 gap-4">

                        {/* Nome / Razão */}
                        <div className="col-span-2">
                            <label className="block text-sm mb-1">
                                {tipo === "J" ? "Razão Social *" : "Nome Completo *"}
                            </label>
                            <input
                                type="text"
                                className="w-full border rounded px-3 py-2"
                                value={form.nome}
                                onChange={(e) => setForm({ ...form, nome: e.target.value })}
                            />
                        </div>

                        {/* CPF/CNPJ */}
                        <div>
                            <label className="block text-sm mb-1">
                                {tipo === "J" ? "CNPJ *" : "CPF *"}
                            </label>
                            <input
                                type="text"
                                className="w-full border rounded px-3 py-2"
                                value={form.cpf_cnpj}
                                onChange={(e) => setForm({ ...form, cpf_cnpj: e.target.value })}
                            />
                        </div>

                        {/* Telefone */}
                        <div>
                            <label className="block text-sm mb-1">Telefone</label>
                            <input
                                type="tel"
                                className="w-full border rounded px-3 py-2"
                                value={form.telefone}
                                onChange={(e) => setForm({ ...form, telefone: e.target.value })}
                            />
                        </div>

                        {/* Email */}
                        <div className="col-span-2">
                            <label className="block text-sm mb-1">Email</label>
                            <input
                                type="email"
                                className="w-full border rounded px-3 py-2"
                                value={form.email}
                                onChange={(e) => setForm({ ...form, email: e.target.value })}
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
                            <select
                                className="w-full border rounded px-3 py-2"
                                value={form.uf}
                                onChange={(e) => setForm({ ...form, uf: e.target.value })}
                            >
                                <option value="">UF</option>
                                {[
                                    "AC", "AL", "AP", "AM", "BA", "CE", "DF", "ES", "GO", "MA", "MT", "MS",
                                    "MG", "PA", "PB", "PR", "PE", "PI", "RJ", "RN", "RS", "RO", "RR", "SC",
                                    "SP", "SE", "TO"
                                ].map((uf) => (
                                    <option key={uf} value={uf}>{uf}</option>
                                ))}
                            </select>
                        </div>

                        {/* Complemento */}
                        <div className="col-span-2">
                            <label className="block text-sm mb-1">Complemento</label>
                            <input
                                type="text"
                                className="w-full border rounded px-3 py-2"
                                value={form.complemento}
                                onChange={(e) =>
                                    setForm({ ...form, complemento: e.target.value })
                                }
                            />
                        </div>

                    </div>

                </div>

                {/* Rodapé */}
                <div className="flex justify-between p-4 border-t bg-gray-50">
                    <button onClick={onClose} className="px-4 py-2 rounded border">
                        Cancelar
                    </button>

                    <button
                        onClick={salvar}
                        disabled={salvando}
                        className="bg-green-600 hover:bg-green-700 text-white px-5 py-2 rounded"
                    >
                        {salvando ? "Salvando..." : "Salvar"}
                    </button>
                </div>

            </div>
        </div>
    );
}
