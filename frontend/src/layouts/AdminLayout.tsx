import { Outlet, Link } from 'react-router-dom';
import { LayoutDashboard, CarFront, Users, CalendarDays, Settings, LogOut } from 'lucide-react';

export default function AdminLayout() {
    return (
        <div className="flex h-screen bg-[var(--color-background)] overflow-hidden">
            {/* Sidebar */}
            <aside className="w-64 bg-[var(--color-surface)] border-r border-[var(--color-surface-light)] flex flex-col hidden md:flex">
                <div className="h-16 flex items-center px-6 border-b border-[var(--color-surface-light)]">
                    <Link to="/admin" className="flex items-center gap-2">
                        <span className="font-bold text-xl text-white tracking-tight text-[var(--color-primary)]">Admin TRM</span>
                    </Link>
                </div>

                <nav className="flex-1 px-4 py-6 space-y-2 overflow-y-auto">
                    <Link to="/admin/dashboard" className="flex items-center gap-3 px-3 py-2 bg-[var(--color-surface-light)] text-white rounded-lg">
                        <LayoutDashboard className="h-5 w-5 text-[var(--color-primary)]" />
                        <span className="font-medium">Tableau de bord</span>
                    </Link>
                    <Link to="/admin/vehicles" className="flex items-center gap-3 px-3 py-2 text-slate-400 hover:text-white hover:bg-[var(--color-surface-light)] rounded-lg transition-colors">
                        <CarFront className="h-5 w-5" />
                        <span className="font-medium">Flotte & Véhicules</span>
                    </Link>
                    <Link to="/admin/bookings" className="flex items-center gap-3 px-3 py-2 text-slate-400 hover:text-white hover:bg-[var(--color-surface-light)] rounded-lg transition-colors">
                        <CalendarDays className="h-5 w-5" />
                        <span className="font-medium">Réservations</span>
                    </Link>
                    <Link to="/admin/customers" className="flex items-center gap-3 px-3 py-2 text-slate-400 hover:text-white hover:bg-[var(--color-surface-light)] rounded-lg transition-colors">
                        <Users className="h-5 w-5" />
                        <span className="font-medium">Clients</span>
                    </Link>
                    <Link to="/admin/settings" className="flex items-center gap-3 px-3 py-2 text-slate-400 hover:text-white hover:bg-[var(--color-surface-light)] rounded-lg transition-colors">
                        <Settings className="h-5 w-5" />
                        <span className="font-medium">Paramètres</span>
                    </Link>
                </nav>

                <div className="p-4 border-t border-[var(--color-surface-light)]">
                    <button className="flex w-full items-center gap-3 px-3 py-2 text-slate-400 hover:text-red-400 hover:bg-slate-800 rounded-lg transition-colors">
                        <LogOut className="h-5 w-5" />
                        <span className="font-medium">Déconnexion</span>
                    </button>
                </div>
            </aside>

            {/* Main Content Workspace */}
            <div className="flex-1 flex flex-col min-w-0">
                <header className="h-16 bg-[var(--color-surface)] border-b border-[var(--color-surface-light)] px-6 flex items-center justify-between lg:justify-end">
                    <div className="flex items-center gap-4">
                        <div className="text-right hidden sm:block">
                            <p className="text-sm font-medium text-white">Administrateur</p>
                            <p className="text-xs text-slate-400">admin@trmrentcar.com</p>
                        </div>
                        <div className="h-10 w-10 bg-[var(--color-primary)] rounded-full flex items-center justify-center text-slate-900 font-bold">
                            AD
                        </div>
                    </div>
                </header>

                <main className="flex-1 p-6 overflow-y-auto">
                    <Outlet />
                </main>
            </div>
        </div>
    );
}
