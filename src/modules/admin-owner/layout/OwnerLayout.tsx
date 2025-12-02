import React, { useState } from 'react';
import { Outlet, NavLink, useNavigate, useLocation } from 'react-router-dom';
import {
    LayoutDashboard,
    Building2,
    Star,
    Menu,
    LogOut,
    ChevronRight,
    Home,
    Calendar,
    BarChart3,
    Settings,
    Users,
    Bell
} from 'lucide-react';
import { useAuth } from '@/auth/hooks/useAuth';
import { ROUTES } from '@/config/routes';

const OwnerLayout: React.FC = () => {
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    const { user, logout } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();

    const handleLogout = () => {
        logout();
        navigate(ROUTES.home);
    };

    const navItems = [
        {
            label: 'Dashboard',
            icon: LayoutDashboard,
            path: ROUTES.owner.dashboard,
            description: 'Vista general'
        },
        {
            label: 'Mis Sedes',
            icon: Building2,
            path: ROUTES.owner.spaces,
            description: 'Gestionar sedes'
        },
        {
            label: 'Canchas',
            icon: Home,
            path: '/owner/fields',
            description: 'Administrar canchas'
        },
        {
            label: 'Reservas',
            icon: Calendar,
            path: '/owner/bookings',
            description: 'Calendario'
        },
        {
            label: 'Reseñas',
            icon: Star,
            path: ROUTES.owner.reviews,
            description: 'Opiniones'
        },
        {
            label: 'Analíticas',
            icon: BarChart3,
            path: '/owner/analytics',
            description: 'Reportes'
        },
        {
            label: 'Asignaciones',
            icon: Users,
            path: '/owner/assignments',
            description: 'Controladores'
        },
        {
            label: 'Configuración',
            icon: Settings,
            path: '/owner/settings',
            description: 'Ajustes'
        },
    ];

    return (
        <div className="min-h-screen bg-gray-50 flex font-sans">
            {/* Mobile Sidebar Overlay */}
            {isSidebarOpen && (
                <div
                    className="fixed inset-0 bg-gray-900/50 backdrop-blur-sm z-40 lg:hidden transition-opacity"
                    onClick={() => setIsSidebarOpen(false)}
                />
            )}

            {/* Sidebar */}
            <aside
                className={`
          fixed lg:static inset-y-0 left-0 z-50 w-72 bg-white border-r border-gray-200 transform transition-transform duration-300 ease-in-out shadow-2xl lg:shadow-none
          ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
`}
            >
                <div className="h-full flex flex-col">
                    {/* Logo Area */}
                    <div className="h-20 flex items-center px-6 border-b border-gray-100">
                        <div className="flex items-center gap-3">
                            <img
                                src="/src/assets/rogu_logo.png"
                                alt="ROGU Logo"
                                className="h-10 w-auto"
                            />
                            <div>
                                <span className="text-xs font-medium text-primary-600 uppercase tracking-wider">
                                    Owner Panel
                                </span>
                            </div>
                        </div>
                    </div>

                    {/* Navigation */}
                    <nav className="flex-1 p-4 space-y-1 overflow-y-auto custom-scrollbar">
                        <div className="mb-4 px-2">
                            <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">
                                Menu Principal
                            </p>
                        </div>
                        {navItems.map((item) => {
                            const isActive = location.pathname === item.path ||
                                (item.path !== ROUTES.owner.dashboard && location.pathname.startsWith(item.path));

                            return (
                                <NavLink
                                    key={item.path}
                                    to={item.path}
                                    onClick={() => setIsSidebarOpen(false)}
                                    className={({ isActive: navIsActive }) => {
                                        const active = navIsActive || isActive;
                                        return `
                                            group flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 relative overflow-hidden
                                            ${active
                                                ? 'bg-primary-50 text-primary-700'
                                                : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                                            }
                                        `;
                                    }}
                                >
                                    {({ isActive: navIsActive }) => {
                                        const active = navIsActive || isActive;
                                        return (
                                            <>
                                                {active && (
                                                    <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-8 bg-primary-600 rounded-r-full" />
                                                )}
                                                <item.icon className={`w-5 h-5 flex-shrink-0 transition-colors ${active ? 'text-primary-600' : 'text-gray-400 group-hover:text-gray-600'}`} />
                                                <div className="flex-1">
                                                    <span>{item.label}</span>
                                                </div>
                                                {active && (
                                                    <ChevronRight className="w-4 h-4 text-primary-500" />
                                                )}
                                            </>
                                        );
                                    }}
                                </NavLink>
                            );
                        })}
                    </nav>

                    {/* User Profile & Logout */}
                    <div className="p-4 border-t border-gray-100 bg-gray-50/50">
                        <div className="flex items-center gap-3 mb-3 px-2">
                            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-gray-700 to-gray-900 flex items-center justify-center text-white font-bold shadow-md">
                                {user?.usuario?.charAt(0).toUpperCase() || 'U'}
                            </div>
                            <div className="flex-1 min-w-0">
                                <p className="text-sm font-bold text-gray-900 truncate">
                                    {user?.usuario}
                                </p>
                                <p className="text-xs text-gray-500 truncate">
                                    {user?.correo}
                                </p>
                            </div>
                        </div>
                        <button
                            onClick={handleLogout}
                            className="flex items-center justify-center gap-2 px-4 py-2 w-full text-sm font-medium text-red-600 bg-red-50 hover:bg-red-100 rounded-lg transition-colors"
                        >
                            <LogOut className="w-4 h-4" />
                            <span>Cerrar Sesión</span>
                        </button>
                    </div>
                </div>
            </aside>

            {/* Main Content Wrapper */}
            <div className="flex-1 flex flex-col min-w-0 h-screen overflow-hidden">
                {/* Top Header */}
                <header className="h-16 bg-white border-b border-gray-200 flex items-center justify-between px-4 lg:px-8 z-30">
                    <div className="flex items-center gap-4">
                        <button
                            onClick={() => setIsSidebarOpen(true)}
                            className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg lg:hidden"
                        >
                            <Menu className="w-6 h-6" />
                        </button>
                        <h2 className="text-lg font-semibold text-gray-800 hidden sm:block">
                            {navItems.find(item => location.pathname === item.path || (item.path !== ROUTES.owner.dashboard && location.pathname.startsWith(item.path)))?.label || 'Dashboard'}
                        </h2>
                    </div>

                    <div className="flex items-center gap-4">
                        <button className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full transition-colors relative">
                            <Bell className="w-5 h-5" />
                            <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full ring-2 ring-white"></span>
                        </button>
                        <div className="h-8 w-px bg-gray-200 hidden sm:block"></div>
                        <div className="flex items-center gap-2">
                            <span className="text-sm text-gray-600 hidden sm:block">
                                {new Date().toLocaleDateString('es-ES', { weekday: 'long', day: 'numeric', month: 'long' })}
                            </span>
                        </div>
                    </div>
                </header>

                {/* Page Content */}
                <main className="flex-1 overflow-y-auto bg-gray-50 p-4 lg:p-8">
                    <div className="max-w-7xl mx-auto">
                        <Outlet />
                    </div>
                </main>
            </div>
        </div>
    );
};

export default OwnerLayout;
