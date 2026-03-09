import { Outlet, Link, useLocation } from 'react-router-dom';
import {
    LayoutDashboard, Car, Users, CalendarDays, Settings,
    LogOut, MapPin, Calculator, Wrench, Bell, UserCog, Menu, X
} from 'lucide-react';
import { useState } from 'react';

export default function AdminLayout() {
    const location = useLocation();
    const [sidebarOpen, setSidebarOpen] = useState(false);

    const menuItems = [
        { path: '/admin', icon: LayoutDashboard, label: 'Tableau de bord' },
        { path: '/admin/reservations', icon: CalendarDays, label: 'Réservations' },
        { path: '/admin/vehicles', icon: Car, label: 'Véhicules' },
        { path: '/admin/customers', icon: Users, label: 'Clients' },
        { path: '/admin/gps', icon: MapPin, label: 'Suivi GPS' },
        { path: '/admin/accounting', icon: Calculator, label: 'Comptabilité' },
        { path: '/admin/maintenance', icon: Wrench, label: 'Maintenance' },
        { path: '/admin/settings', icon: Settings, label: 'Paramètres' },
        { path: '/admin/users', icon: UserCog, label: 'Administrateurs' },
    ];

    return (
        <div className="min-h-screen bg-[#070b10] flex text-[var(--color-text-main)] font-sans">

            {/* Mobile Sidebar Overlay */}
            {sidebarOpen && (
                <div
                    className="fixed inset-0 bg-black/60 z-40 lg:hidden backdrop-blur-sm"
                    onClick={() => setSidebarOpen(false)}
                />
            )}

            {/* Sidebar CRM Style */}
            <aside className={`fixed inset-y-0 left-0 w-64 bg-[#101520] border-r border-[#1f2937] z-50 transform transition-transform duration-300 ease-in-out lg:translate-x-0 lg:static lg:block ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}>
                <div className="h-full flex flex-col">
                    <div className="h-16 flex items-center justify-between px-6 border-b border-[#1f2937] bg-[#0c101a]">
                        <Link to="/" className="flex items-center">
                            <img src="/trm-logo-pour-arriere-noir.png" alt="TRM Rent Car" className="h-8 object-contain" />
                            <span className="ml-2 font-black text-white tracking-widest uppercase text-xs">Admin</span>
                        </Link>
                        <button onClick={() => setSidebarOpen(false)} className="lg:hidden text-slate-400 hover:text-white">
                            <X className="w-5 h-5" />
                        </button>
                    </div>

                    <nav className="flex-1 overflow-y-auto py-6 px-4 space-y-1">
                        <div className="text-xs font-bold tracking-widest text-slate-500 uppercase px-3 mb-4 mt-2">Plates-formes</div>
                        {menuItems.map((item) => {
                            const Icon = item.icon;
                            const isActive = location.pathname === item.path;
                            return (
                                <Link
                                    key={item.path}
                                    to={item.path}
                                    className={`flex items-center px-3 py-2.5 rounded-sm transition-all text-sm font-medium ${isActive
                                            ? 'bg-[var(--color-primary)]/10 text-[var(--color-primary)] border-r-2 border-[var(--color-primary)]'
                                            : 'text-slate-400 hover:text-white hover:bg-white/5'
                                        }`}
                                >
                                    <Icon className={`w-5 h-5 mr-3 ${isActive ? 'text-[var(--color-primary)]' : 'text-slate-500'}`} />
                                    {item.label}
                                </Link>
                            );
                        })}
                    </nav>

                    <div className="p-4 border-t border-[#1f2937] bg-[#0c101a]">
                        <div className="flex items-center px-3 py-3 mb-2 bg-[#171e2e] rounded-sm border border-[#2b3548]">
                            <div className="w-8 h-8 rounded-full bg-gradient-gold flex items-center justify-center text-slate-900 font-bold uppercase text-xs">
                                AD
                            </div>
                            <div className="ml-3">
                                <p className="text-sm font-bold text-white leading-tight">Admin Demo</p>
                                <p className="text-xs text-slate-400">Super Admin</p>
                            </div>
                        </div>
                        <button className="flex w-full items-center px-3 py-2 text-red-400 hover:text-red-300 hover:bg-red-400/10 rounded-sm transition-colors text-sm font-medium">
                            <LogOut className="w-5 h-5 mr-3" />
                            Déconnexion
                        </button>
                    </div>
                </div>
            </aside>

            {/* Main Content Area */}
            <main className="flex-1 flex flex-col min-w-0 overflow-hidden">
                {/* Header CRM Style */}
                <header className="h-16 bg-[#101520] border-b border-[#1f2937] px-6 flex items-center justify-between lg:justify-end shrink-0 shadow-sm z-30">
                    <button onClick={() => setSidebarOpen(true)} className="lg:hidden text-slate-400 hover:text-white">
                        <Menu className="w-6 h-6" />
                    </button>
                    <div className="flex items-center gap-4">
                        <button className="p-2 text-slate-400 hover:text-white relative">
                            <Bell className="w-5 h-5" />
                            <span className="absolute top-1 right-2 w-2 h-2 bg-red-500 rounded-full border border-[#101520]"></span>
                        </button>
                    </div>
                </header>

                <div className="flex-1 overflow-auto bg-[#070b10] p-6 text-slate-200">
                    <div className="max-w-7xl mx-auto">
                        <Outlet />
                    </div>
                </div>
            </main>
        </div>
    );
}
