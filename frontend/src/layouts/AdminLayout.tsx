import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom';
import {
    LayoutDashboard, Car, Users, CalendarDays, Settings,
    LogOut, MapPin, Calculator, Wrench, Bell, UserCog, Menu, X, ChevronRight, AlertTriangle
} from 'lucide-react';
import { useState } from 'react';

export default function AdminLayout() {
    const location = useLocation();
    const navigate = useNavigate();
    const [sidebarOpen, setSidebarOpen] = useState(false);

    const menuItems = [
        { path: '/admin', icon: LayoutDashboard, label: 'Tableau de bord' },
        { path: '/admin/reservations', icon: CalendarDays, label: 'Réservations' },
        { path: '/admin/vehicles', icon: Car, label: 'Véhicules' },
        { path: '/admin/customers', icon: Users, label: 'Clients' },
        { path: '/admin/infractions', icon: AlertTriangle, label: 'Infractions' },
        { path: '/admin/gps', icon: MapPin, label: 'Suivi GPS' },
        { path: '/admin/accounting', icon: Calculator, label: 'Comptabilité' },
        { path: '/admin/maintenance', icon: Wrench, label: 'Maintenance' },
        { path: '/admin/settings', icon: Settings, label: 'Paramètres' },
        { path: '/admin/users', icon: UserCog, label: 'Administrateurs' },
    ];

    const handleLogout = () => {
        navigate('/login');
    };

    return (
        <div className="min-h-screen bg-[#F0F4FF] flex font-sans">

            {/* Mobile Sidebar Overlay */}
            {sidebarOpen && (
                <div
                    className="fixed inset-0 bg-black/40 z-40 lg:hidden backdrop-blur-sm"
                    onClick={() => setSidebarOpen(false)}
                />
            )}

            {/* Sidebar — Deep Indigo */}
            <aside className={`fixed inset-y-0 left-0 w-72 bg-gradient-to-b from-[#1C0770] to-[#0F0440] z-50 transform transition-transform duration-300 ease-in-out lg:translate-x-0 lg:static lg:block shadow-2xl ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}>
                <div className="h-full flex flex-col">
                    {/* Logo Header */}
                    <div className="h-20 flex items-center justify-between px-6 border-b border-white/10">
                        <Link to="/" className="flex items-center gap-3 group">
                            <img
                                src="/trm-logo-pour-arriere-noir.png"
                                alt="TRM Rent Car"
                                className="h-12 object-contain drop-shadow-[0_0_15px_rgba(58,154,255,0.4)] group-hover:drop-shadow-[0_0_25px_rgba(58,154,255,0.7)] transition-all duration-500"
                            />
                            <div className="flex flex-col">
                                <span className="text-white font-black text-sm tracking-[0.2em] uppercase leading-none">Admin</span>
                                <span className="text-[#3A9AFF] text-[10px] font-bold tracking-widest uppercase">Panel</span>
                            </div>
                        </Link>
                        <button onClick={() => setSidebarOpen(false)} className="lg:hidden text-white/60 hover:text-white">
                            <X className="w-5 h-5" />
                        </button>
                    </div>

                    {/* Navigation */}
                    <nav className="flex-1 overflow-y-auto py-6 px-4 space-y-1">
                        <div className="text-[10px] font-bold tracking-[0.25em] text-[#3A9AFF]/60 uppercase px-3 mb-4">Navigation</div>
                        {menuItems.map((item) => {
                            const Icon = item.icon;
                            const isActive = location.pathname === item.path;
                            return (
                                <Link
                                    key={item.path}
                                    to={item.path}
                                    onClick={() => setSidebarOpen(false)}
                                    className={`group flex items-center px-4 py-3 rounded-xl transition-all duration-300 text-sm font-semibold ${isActive
                                        ? 'bg-[#3A9AFF] text-white shadow-[0_4px_20px_rgba(58,154,255,0.4)]'
                                        : 'text-white/60 hover:text-white hover:bg-white/8'
                                        }`}
                                >
                                    <Icon className={`w-5 h-5 mr-3 transition-transform duration-300 ${isActive ? '' : 'group-hover:scale-110'}`} />
                                    {item.label}
                                    {isActive && <ChevronRight className="w-4 h-4 ml-auto" />}
                                </Link>
                            );
                        })}
                    </nav>

                    {/* User Info & Logout */}
                    <div className="p-4 border-t border-white/10">
                        <div className="flex items-center px-4 py-3 mb-3 bg-white/5 rounded-xl border border-white/10">
                            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#3A9AFF] to-[#261CC1] flex items-center justify-center text-white font-black text-sm shadow-lg">
                                MT
                            </div>
                            <div className="ml-3">
                                <p className="text-sm font-bold text-white leading-tight">Med Tahiri</p>
                                <p className="text-xs text-[#3A9AFF]">Super Admin</p>
                            </div>
                        </div>
                        <button
                            onClick={handleLogout}
                            className="flex w-full items-center px-4 py-2.5 text-red-300 hover:text-white hover:bg-red-500/20 rounded-xl transition-all text-sm font-semibold"
                        >
                            <LogOut className="w-5 h-5 mr-3" />
                            Déconnexion
                        </button>
                    </div>
                </div>
            </aside>

            {/* Main Content Area */}
            <main className="flex-1 flex flex-col min-w-0 overflow-hidden">
                {/* Top Header */}
                <header className="h-16 bg-white border-b border-slate-200 px-6 flex items-center justify-between lg:justify-end shrink-0 shadow-sm z-30">
                    <button onClick={() => setSidebarOpen(true)} className="lg:hidden text-slate-500 hover:text-[#1C0770]">
                        <Menu className="w-6 h-6" />
                    </button>
                    <div className="flex items-center gap-4">
                        <button className="p-2.5 text-slate-400 hover:text-[#261CC1] hover:bg-[#261CC1]/5 rounded-xl relative transition-colors">
                            <Bell className="w-5 h-5" />
                            <span className="absolute top-1.5 right-1.5 w-2.5 h-2.5 bg-red-500 rounded-full border-2 border-white animate-pulse"></span>
                        </button>
                        <div className="hidden sm:flex items-center gap-2 pl-4 border-l border-slate-200">
                            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[#3A9AFF] to-[#261CC1] flex items-center justify-center text-white font-bold text-xs">MT</div>
                            <span className="text-sm font-semibold text-slate-700">Med Tahiri</span>
                        </div>
                    </div>
                </header>

                <div className="flex-1 overflow-auto bg-[#F0F4FF] p-6">
                    <div className="max-w-7xl mx-auto">
                        <Outlet />
                    </div>
                </div>
            </main>
        </div>
    );
}
