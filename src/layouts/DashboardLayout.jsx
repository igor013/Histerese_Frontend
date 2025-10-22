import { NavLink, Outlet, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";

const ui = {
    shell: { display: "grid", gridTemplateColumns: "240px 1fr", height: "100vh" },
    sidebar: { background: "#0f172a", color: "#e2e8f0", padding: 16, display: "flex", flexDirection: "column", gap: 8 },
    brand: { fontWeight: 700, fontSize: 18, marginBottom: 12 },
    link: (active) => ({
        padding: "10px 12px",
        borderRadius: 10,
        textDecoration: "none",
        fontWeight: 600,
        color: active ? "#0f172a" : "#e2e8f0",
        background: active ? "#e2e8f0" : "transparent",
    }),
    main: { display: "grid", gridTemplateRows: "56px 1fr", background: "#f8fafc" },
    topbar: { background: "#fff", borderBottom: "1px solid #e5e7eb", display: "flex", alignItems: "center", justifyContent: "space-between", padding: "0 16px" },
    content: { padding: 16, overflow: "auto" },
    btn: { border: "1px solid #e5e7eb", padding: "6px 10px", borderRadius: 8, background: "#fff", cursor: "pointer" },
};

const items = [
    { to: "/app", label: "Início" },            // usa seu pages/Dashboard.jsx
    { to: "/app/empresas", label: "Empresa" },  // pages/Empresas.jsx
    { to: "/app/usuarios", label: "Usuários" }, // (quando existir)
    { to: "/app/clientes", label: "Clientes" }, // pages/Clientes.jsx
    { to: "/app/produtos", label: "Produtos" }, // pages/Produtos.jsx
    { to: "/app/notas", label: "Notas Fiscais" }, // pages/Notas.jsx
    { to: "/app/equipamentos", label: "Equipamentos" }, // pages/Equipamentos.jsx
];

export default function DashboardLayout() {
    const navigate = useNavigate();
    const [empresaNome, setEmpresaNome] = useState("Histerese ERP");

    useEffect(() => {
        const nome = localStorage.getItem("empresa_nome");
        if (nome) setEmpresaNome(nome);
    }, []);

    function sair() {
        localStorage.removeItem("token");
        localStorage.removeItem("empresa_nome");
        navigate("/login", { replace: true });
    }

    return (
        <div style={ui.shell}>
            <aside style={ui.sidebar}>
                <div style={ui.brand}>🧭 {empresaNome}</div>
                {items.map((item) => (
                    <NavLink key={item.to} to={item.to} end
                        style={({ isActive }) => ui.link(isActive)}>
                        {item.label}
                    </NavLink>
                ))}
            </aside>

            <section style={ui.main}>
                <div style={ui.topbar}>
                    <strong>Dashboard</strong>
                    <button onClick={sair} style={ui.btn}>Sair</button>
                </div>
                <div style={ui.content}>
                    <Outlet />
                </div>
            </section>
        </div>
    );
}
