import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom';
import {
    LayoutDashboard, Car, Users, CalendarDays, Settings,
    LogOut, MapPin, Calculator, Wrench, Bell, UserCog, Menu, X, ChevronRight, AlertTriangle, Loader2, Mail, Shield
} from 'lucide-react';
import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';

export default function AdminLayout() {
    const location = useLocation();
    const navigate = useNavigate();
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const [profile, setProfile] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchProfile = async () => {
            const { data: { session } } = await supabase.auth.getSession();
            if (!session) {
                navigate('/login');
                return;
            }

            const { data } = await supabase
                .from('profiles')
                .select('*')
                .eq('id', session.user.id)
                .single();

            // Force Sara's profile to assistant role for the UI
            let profileData = data;
            if (profileData?.email === 'sara.b@trmrentcar.ma') {
                profileData = { ...profileData, role: 'assistant' };
                // Try to update DB in background, but don't block
                supabase.from('profiles').update({ role: 'assistant' }).eq('id', data.id).then(() => { });
            }

            setProfile(profileData);
            setLoading(false);
        };

        fetchProfile();
    }, [navigate]);

    const fullMenuItems = [
        { path: '/admin', icon: LayoutDashboard, label: 'Tableau de bord', roles: ['super_admin'] },
        { path: '/admin/messages', icon: Mail, label: 'Boîte Mail', roles: ['super_admin', 'assistant'] },
        { path: '/admin/reservations', icon: CalendarDays, label: 'Réservations', roles: ['super_admin', 'assistant'] },
        { path: '/admin/vehicles', icon: Car, label: 'Véhicules', roles: ['super_admin', 'admin'] },
        { path: '/admin/customers', icon: Users, label: 'Clients', roles: ['super_admin', 'assistant'] },
        { path: '/admin/infractions', icon: AlertTriangle, label: 'Infractions', roles: ['super_admin', 'assistant'] },
        { path: '/admin/gps', icon: MapPin, label: 'Suivi GPS', roles: ['super_admin', 'admin'] },
        { path: '/admin/maintenance', icon: Wrench, label: 'Maintenance', roles: ['super_admin', 'admin'] },
        { path: '/admin/accounting', icon: Calculator, label: 'Comptabilité', roles: ['super_admin'] },
        { path: '/admin/users', icon: UserCog, label: 'Administrateurs', roles: ['super_admin'] },
    ];

    const menuItems = fullMenuItems.filter(item =>
        profile && (item.roles.includes(profile.role))
    );

    const handleLogout = async () => {
        await supabase.auth.signOut();
        navigate('/login');
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-[#F0F4FF] flex items-center justify-center">
                <Loader2 className="w-12 h-12 text-[#261CC1] animate-spin" />
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-[#F0F4FF] flex font-sans text-slate-900">

            {/* Mobile Sidebar Overlay */}
            {sidebarOpen && (
                <div
                    className="fixed inset-0 bg-black/40 z-40 lg:hidden backdrop-blur-sm"
                    onClick={() => setSidebarOpen(false)}
                />
            )}

            {/* Sidebar — Fixed/Sticky */}
            <aside className={`fixed inset-y-0 left-0 w-72 bg-gradient-to-b from-[#1C0770] to-[#0F0440] z-50 transform transition-transform duration-300 ease-in-out lg:translate-x-0 lg:sticky lg:top-0 lg:h-screen lg:block shadow-2xl ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}>
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

                    {/* Footer Info */}
                    <div className="p-6 border-t border-white/10">
                        <div className="flex items-center gap-3 text-white/40 text-[10px] font-black uppercase tracking-widest">
                            <Shield className="w-3 h-3" />
                            <span>TRM Secure Access</span>
                        </div>
                    </div>
                </div>
            </aside>

            {/* Main Content Area */}
            <main className="flex-1 flex flex-col min-w-0 overflow-hidden">
                {/* Top Header */}
                <header className="h-16 bg-white border-b border-slate-200 px-6 flex items-center justify-between z-30 shadow-sm shrink-0">
                    <button onClick={() => setSidebarOpen(true)} className="lg:hidden text-slate-500 hover:text-[#1C0770]">
                        <Menu className="w-6 h-6" />
                    </button>

                    <div className="flex-1 lg:flex justify-end hidden">
                        <div className="max-w-xs w-full mr-8">
                            {/* Optional search or other header elements */}
                        </div>
                    </div>

                    <div className="flex items-center gap-3">
                        {profile?.role === 'super_admin' && (
                            <Link to="/admin/settings" className="p-2.5 text-slate-400 hover:text-[#261CC1] hover:bg-[#261CC1]/5 rounded-xl transition-colors" title="Paramètres">
                                <Settings className="w-5 h-5" />
                            </Link>
                        )}
                        <button className="p-2.5 text-slate-400 hover:text-[#261CC1] hover:bg-[#261CC1]/5 rounded-xl relative transition-colors" title="Notifications">
                            <Bell className="w-5 h-5" />
                            <span className="absolute top-1.5 right-1.5 w-2.5 h-2.5 bg-red-500 rounded-full border-2 border-white animate-pulse"></span>
                        </button>

                        <div className="flex items-center gap-3 pl-4 border-l border-slate-200">
                            <div className="text-right hidden sm:block">
                                <p className="text-sm font-bold text-slate-800 leading-tight">{profile?.full_name}</p>
                                <p className="text-[10px] font-black text-[#3A9AFF] uppercase tracking-tighter">
                                    {profile?.role === 'assistant' ? 'Assistant(e)' : profile?.role === 'admin' ? 'Gestionnaire' : 'Super Admin'}
                                </p>
                            </div>
                            <div className="relative group">
                                <button className="w-10 h-10 rounded-full bg-gradient-to-br from-[#3A9AFF] to-[#261CC1] flex items-center justify-center text-white font-black text-sm shadow-md hover:scale-105 transition-transform">
                                    {profile?.full_name[0].toUpperCase()}
                                </button>

                                <div className="absolute right-0 mt-2 w-48 bg-white border border-slate-100 rounded-2xl shadow-2xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 transform origin-top-right scale-95 group-hover:scale-100 py-2 z-50">
                                    <button
                                        onClick={handleLogout}
                                        className="w-full flex items-center px-4 py-2.5 text-red-500 hover:bg-red-50 transition-colors text-sm font-bold"
                                    >
                                        <LogOut className="w-4 h-4 mr-3" />
                                        Déconnexion
                                    </button>
                                </div>
                            </div>
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
