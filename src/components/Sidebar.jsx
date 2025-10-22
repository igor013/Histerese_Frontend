import { Link } from "react-router-dom";

export default function Sidebar() {
    return (
        <aside className="w-64 bg-gray-800 text-white flex flex-col">
            <div className="p-4 text-2xl font-bold text-center border-b border-gray-700">
                Histerese ERP
            </div>

            <nav className="flex-1 p-4 space-y-2">
                <Link to="/" className="block p-2 rounded hover:bg-gray-700">🏠 Dashboard</Link>
                <Link to="/empresas" className="block p-2 rounded hover:bg-gray-700">🏢 Empresas</Link>
                <Link to="/clientes" className="block p-2 rounded hover:bg-gray-700">👥 Clientes</Link>
                <Link to="/produtos" className="block p-2 rounded hover:bg-gray-700">📦 Produtos</Link>
                <Link to="/notas" className="block p-2 rounded hover:bg-gray-700">🧾 Notas Fiscais</Link>
                <Link to="/equipamentos" className="block p-2 rounded hover:bg-gray-700">⚙️ Equipamentos</Link>
            </nav>
        </aside>
    );
}
