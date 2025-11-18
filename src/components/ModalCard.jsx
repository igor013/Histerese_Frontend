import ModalCard from "../components/ModalCard";
import { FaSave, FaTimes, FaTrashAlt } from "react-icons/fa";

// ...

{
    modo && (
        <ModalCard
            title={modo === "novo" ? "Cadastrar Novo Usuário" : "Editar Usuário"}
            onClose={fecharCard}
            extraTopRight={
                modo === "editar" && (
                    <button
                        onClick={() => setConfirmarExclusao((v) => !v)}
                        className="flex items-center gap-2 text-gray-500 hover:text-red-600 transition-colors text-sm font-medium"
                    >
                        <FaTrashAlt size={14} /> Excluir
                    </button>
                )
            }
            actions={[
                <button
                    key="salvar"
                    type="button"
                    onClick={salvar}
                    disabled={!houveAlteracao || loading}
                    className={`px-3 py-1.5 rounded flex items-center gap-2 ${houveAlteracao
                            ? "bg-green-600 hover:bg-green-700 text-white"
                            : "bg-gray-300 text-gray-500 cursor-not-allowed"
                        }`}
                >
                    <FaSave /> {loading ? "Salvando..." : "Salvar"}
                </button>,
                <button
                    key="cancelar"
                    type="button"
                    onClick={fecharCard}
                    className="px-3 py-1.5 rounded bg-gray-300 hover:bg-gray-400 text-gray-700 flex items-center gap-2"
                >
                    <FaTimes /> Cancelar
                </button>,
            ]}
        >
            {/* aqui dentro ficam os campos */}
            <div>
                <label className="block text-sm text-gray-600 mb-1">Nome</label>
                <input
                    value={formData.nome}
                    onChange={(e) => setFormData({ ...formData, nome: e.target.value })}
                    className="border rounded px-3 py-1.5 w-full"
                />
            </div>
            <div>
                <label className="block text-sm text-gray-600 mb-1">Login</label>
                <input
                    value={formData.login}
                    onChange={(e) =>
                        setFormData({ ...formData, login: e.target.value.toUpperCase() })
                    }
                    className="border rounded px-3 py-1.5 w-full uppercase"
                />
            </div>
        </ModalCard>
    )
}
