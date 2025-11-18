import { NavLink } from "react-router-dom";
import {
    Home,
    Users,
    Package,
    FileText,
    Wrench,
    ClipboardList,
    Building2,
    Layers,
} from "lucide-react";

export default function Sidebar() {
    const menuItems = [
        { name: "Início", path: "/app", icon: <Home size={18} /> },
        { name: "Usuários", path: "/app/usuarios", icon: <Users size={18} /> },
        { name: "Clientes", path: "/app/clientes", icon: <Users size={18} /> },
        { name: "Produtos", path: "/app/produtos", icon: <Package size={18} /> },
        { name: "Grupos", path: "/app/grupos", icon: <Layers size={18} /> }, // ✅ novo item
        { name: "Fornecedores", path: "/app/fornecedores", icon: <Building2 size={18} /> },
        { name: "Notas Fiscais", path: "/app/notas", icon: <FileText size={18} /> },
        { name: "Equipamentos", path: "/app/equipamentos", icon: <Wrench size={18} /> },
        { name: "Orçamentos", path: "/app/orcamentos", icon: <ClipboardList size={18} /> },
    ];

    return (
        <aside
            className="
        fixed
        top-[5.5rem]
        left-4
        w-64
        h-[calc(100vh-4rem)]
        bg-white
        border
        border-gray-200
        rounded-xl
        shadow-sm
        z-30
        flex
        flex-col
      "
        >
            {/* Menu principal */}
            <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
                {menuItems.map((item) => (
                    <NavLink
                        key={item.name}
                        to={item.path}
                        end={item.path === "/app"}
                        className={({ isActive }) =>
                            `flex items-center gap-2 px-3 py-2 rounded-md text-sm font-medium transition ${isActive
                                ? "bg-[#32b0d9] text-white shadow-sm"
                                : "text-gray-700 hover:bg-[#32b0d9]/10 hover:text-[#32b0d9]"
                            }`
                        }
                    >
                        {item.icon}
                        {item.name}
                    </NavLink>
                ))}
            </nav>
        </aside>
    );
}
