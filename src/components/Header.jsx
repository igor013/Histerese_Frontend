import { useContext, useState, useRef, useEffect } from "react";
import { AuthContext } from "../context/AuthContext";
import { User, ChevronDown, Building2, LogOut } from "lucide-react";
import { useNavigate } from "react-router-dom";

export default function Header() {
    const { user, logout } = useContext(AuthContext);
    const [menuOpen, setMenuOpen] = useState(false);
    const menuRef = useRef();
    const navigate = useNavigate();

    useEffect(() => {
        function handleClickOutside(event) {
            if (menuRef.current && !menuRef.current.contains(event.target)) {
                setMenuOpen(false);
            }
        }
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    return (
        <header className="fixed top-0 left-0 right-0 h-16 bg-[#32b0d9] text-white flex items-center justify-between px-6 shadow-md z-40">
            {/* Logo à esquerda */}
            <div className="flex items-center gap-3">
                <img
                    src="/public/logo.png"
                    alt="Logo Histerese"
                    className="h-24 object-contain"
                />
            </div>

            {/* Usuário à direita */}
            <div className="relative" ref={menuRef}>
                <button
                    onClick={() => setMenuOpen(!menuOpen)}
                    className="flex items-center gap-2 bg-[#4dc3ea] px-3 py-1.5 rounded-full hover:bg-[#37a9cd] transition"
                >
                    <User size={18} />
                    <span className="text-sm font-medium uppercase">
                        {user?.login || user?.nome || "Usuário"}
                    </span>
                    <ChevronDown size={16} />
                </button>

                {menuOpen && (
                    <div className="absolute right-0 mt-2 w-52 bg-white text-gray-700 rounded-md shadow-lg overflow-hidden z-50">
                        <button
                            onClick={() => {
                                setMenuOpen(false);
                                navigate("/app/empresas");
                            }}
                            className="w-full text-left px-4 py-2 hover:bg-gray-100 flex items-center gap-2"
                        >
                            <Building2 size={16} />
                            <span>Cadastro de Empresa</span>
                        </button>

                        <button
                            onClick={() => {
                                setMenuOpen(false);
                                logout();
                                navigate("/login");
                            }}
                            className="w-full text-left px-4 py-2 hover:bg-gray-100 flex items-center gap-2 text-red-600"
                        >
                            <LogOut size={16} />
                            <span>Sair</span>
                        </button>
                    </div>
                )}
            </div>
        </header>
    );
}
