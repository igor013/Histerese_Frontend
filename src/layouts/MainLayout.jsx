import Sidebar from "../components/Sidebar";
import Header from "../components/Header";

export default function MainLayout({ children }) {
    return (
        <div className="flex h-screen bg-gray-100">
            {/* Sidebar fixa */}
            <Sidebar />

            {/* Área principal */}
            <div className="flex flex-col flex-1">
                <Header />
                <main className="flex-1 p-6 overflow-y-auto">{children}</main>
            </div>
        </div>

    );
}
