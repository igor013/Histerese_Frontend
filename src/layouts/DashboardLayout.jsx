// src/layouts/DashboardLayout.jsx
import { Outlet } from "react-router-dom";
import Sidebar from "../components/Sidebar";
import Header from "../components/Header";

export default function DashboardLayout() {
    return (
        <div className="flex h-screen bg-[#f4f6f9] text-gray-800 overflow-hidden">
            {/* Header fixo no topo */}
            <div className="fixed top-0 left-0 w-full z-20">
                <Header />
            </div>

            {/* Sidebar fixa com largura controlada */}
            <div className="fixed top-[5.5rem] left-0 h-[calc(100%-5.5rem)] w-64 bg-white z-10 border-r border-gray-200">
                <Sidebar />
            </div>

            {/* Área principal fixa */}
            <div className="flex flex-col flex-1 pl-64 pt-[4rem] h-screen">
                {/* Card principal fixo */}
                <main className="flex-1 p-6 flex items-center justify-center">
                    <div className="bg-white rounded-xl shadow-md p-6 w-full h-[82vh] overflow-y-auto">
                        <Outlet />
                    </div>
                </main>

                {/* Rodapé fixo visível */}
                <footer className="text-center text-gray-500 text-sm bg-[#f4f6f9] -mt-3">
                    © {new Date().getFullYear()}{" "}
                    <span className="font-semibold">Histerese</span>
                </footer>
            </div>
        </div>
    );
}
