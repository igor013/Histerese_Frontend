import { useAuth } from "../context/AuthContext";

export default function Header() {
    const { logout } = useAuth();

    return (
        <header className="bg-white shadow p-4 flex justify-between items-center">
            <h1 className="text-xl font-semibold text-gray-800">Painel Administrativo</h1>

            <button
                onClick={logout}
                className="bg-red-500 text-white px-3 py-1 rounded hover:bg-red-600"
            >
                Sair
            </button>
        </header>
    );
}
