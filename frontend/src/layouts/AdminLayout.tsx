import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom';
import {
    LayoutDashboard, Car, Users, CalendarDays, Settings,
    LogOut, MapPin, Calculator, Wrench, Bell, UserCog, Menu, X, ChevronRight, ChevronDown, AlertTriangle, Loader2, Mail, Shield
} from 'lucide-react';
import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { notificationsApi } from '../lib/api';
import { formatDistanceToNow } from 'date-fns';
import { fr } from 'date-fns/locale';

export default function AdminLayout() {
    const location = useLocation();
    const navigate = useNavigate();
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const [profile, setProfile] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [notifications, setNotifications] = useState<any[]>([]);
    const [showNotifications, setShowNotifications] = useState(false);
    const [openSubMenus, setOpenSubMenus] = useState<string[]>(['Véhicules']);

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
                supabase.from('profiles').update({ role: 'assistant' }).eq('id', data.id).then(() => { });
            }

            setProfile(profileData);
            setLoading(false);

            // Fetch notifications
            const notifs = await notificationsApi.getAll();
            setNotifications(notifs);

            // Subscribe to new notifications
            const channel = supabase.channel('public:system_notifications')
                .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'system_notifications' }, (payload) => {
                    if (!payload.new.profile_id || payload.new.profile_id === session.user.id) {
                        setNotifications(prev => [payload.new, ...prev]);
                    }
                })
                .subscribe();

            return () => {
                supabase.removeChannel(channel);
            };
        };

        fetchProfile();
    }, [navigate]);

    const unreadCount = notifications.filter(n => !n.is_read).length;

    const handleQuickRead = async (id: string, link: string) => {
        await notificationsApi.markAsRead(id);
        setNotifications(prev => prev.map(n => n.id === id ? { ...n, is_read: true } : n));
        setShowNotifications(false);
        if (link) navigate(link);
    };

    const fullMenuItems = [
        { path: '/admin', icon: LayoutDashboard, label: 'Tableau de bord', roles: ['super_admin'] },
        { path: '/admin/messages', icon: Mail, label: 'Boîte Mail', roles: ['super_admin', 'assistant'] },
        { path: '/admin/reservations', icon: CalendarDays, label: 'Réservations', roles: ['super_admin', 'assistant'] },
        {
            label: 'Véhicules', icon: Car, roles: ['super_admin', 'admin', 'assistant'],
            children: [
                { path: '/admin/vehicles', label: 'Flotte globale', roles: ['super_admin', 'admin'] },
                { path: '/admin/rented-vehicles', label: 'Véhicules Loués', roles: ['super_admin', 'admin', 'assistant'] },
            ]
        },
        {
            label: 'Clients & Ventes', icon: Users, roles: ['super_admin', 'assistant'],
            children: [
                { path: '/admin/customers', label: 'Annuaire Clients', roles: ['super_admin', 'assistant'] },
                { path: '/admin/contracts', label: 'Contrats de Location', roles: ['super_admin', 'assistant'] },
                { path: '/admin/invoices', label: 'Facturation', roles: ['super_admin', 'assistant'] },
            ]
        },
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
                    <nav className="flex-1 overflow-y-auto custom-scrollbar py-6 px-4 space-y-1">
                        <div className="text-[10px] font-bold tracking-[0.25em] text-[#3A9AFF]/60 uppercase px-3 mb-4">Navigation</div>
                        {menuItems.map((item) => {
                            if (item.children) {
                                const isOpen = openSubMenus.includes(item.label);
                                const allowedChildren = item.children.filter(child => profile && child.roles.includes(profile.role));
                                if (allowedChildren.length === 0) return null;

                                const isChildActive = allowedChildren.some(child => location.pathname === child.path);

                                return (
                                    <div key={item.label} className="space-y-1">
                                        <button
                                            onClick={() => setOpenSubMenus(prev => isOpen ? prev.filter(l => l !== item.label) : [...prev, item.label])}
                                            className={`w-full group flex items-center px-4 py-3 rounded-xl transition-all duration-300 text-sm font-semibold ${isChildActive && !isOpen
                                                ? 'bg-[#3A9AFF]/20 text-white shadow-sm'
                                                : 'text-white/60 hover:text-white hover:bg-white/5'
                                                }`}
                                        >
                                            <item.icon className="w-5 h-5 mr-3 transition-transform duration-300 group-hover:scale-110" />
                                            {item.label}
                                            <ChevronDown className={`w-4 h-4 ml-auto transition-transform ${isOpen ? 'rotate-180' : ''}`} />
                                        </button>

                                        <div className={`pl-11 pr-2 space-y-1 overflow-hidden transition-all duration-300 ${isOpen ? 'max-h-40 opacity-100 mb-2 mt-1' : 'max-h-0 opacity-0'}`}>
                                            {allowedChildren.map(child => {
                                                const isActive = location.pathname === child.path;
                                                return (
                                                    <Link
                                                        key={child.path}
                                                        to={child.path}
                                                        onClick={() => setSidebarOpen(false)}
                                                        className={`block px-4 py-2 rounded-lg transition-all duration-300 text-xs font-semibold ${isActive
                                                            ? 'bg-[#3A9AFF] text-white shadow-[0_4px_20px_rgba(58,154,255,0.4)]'
                                                            : 'text-white/50 hover:text-white hover:bg-white/5'
                                                            }`}
                                                    >
                                                        {child.label}
                                                    </Link>
                                                );
                                            })}
                                        </div>
                                    </div>
                                );
                            }

                            const Icon = item.icon;
                            const isActive = location.pathname === item.path;
                            return (
                                <Link
                                    key={item.path}
                                    to={item.path!}
                                    onClick={() => setSidebarOpen(false)}
                                    className={`group flex items-center px-4 py-3 rounded-xl transition-all duration-300 text-sm font-semibold ${isActive
                                        ? 'bg-[#3A9AFF] text-white shadow-[0_4px_20px_rgba(58,154,255,0.4)]'
                                        : 'text-white/60 hover:text-white hover:bg-white/5'
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
                        {/* NOTIFICATIONS */}
                        <div className="relative">
                            <button
                                onClick={() => setShowNotifications(!showNotifications)}
                                className="p-2.5 text-slate-400 hover:text-[#261CC1] hover:bg-[#261CC1]/5 rounded-xl relative transition-colors"
                                title="Notifications"
                            >
                                <Bell className="w-5 h-5" />
                                {unreadCount > 0 && (
                                    <span className="absolute top-1.5 right-1.5 w-4 h-4 bg-red-500 rounded-full border-2 border-white flex items-center justify-center text-[8px] font-black text-white">
                                        {unreadCount > 9 ? '9+' : unreadCount}
                                    </span>
                                )}
                            </button>

                            {/* Notifications Dropdown */}
                            {showNotifications && (
                                <>
                                    <div className="fixed inset-0 z-40" onClick={() => setShowNotifications(false)}></div>
                                    <div className="absolute right-0 mt-2 w-80 bg-white border border-slate-100 rounded-2xl shadow-[0_10px_40px_rgba(0,0,0,0.1)] py-3 z-50 flex flex-col max-h-96">
                                        <div className="px-4 pb-2 border-b border-slate-100 flex items-center justify-between shrink-0">
                                            <h3 className="font-bold text-[#1C0770] text-sm">Notifications</h3>
                                            {unreadCount > 0 && (
                                                <button
                                                    onClick={async () => {
                                                        await notificationsApi.markAllAsRead();
                                                        setNotifications(prev => prev.map(n => ({ ...n, is_read: true })));
                                                    }}
                                                    className="text-[10px] uppercase font-bold text-[#3A9AFF] hover:text-[#261CC1]"
                                                >
                                                    Tout marquer lu
                                                </button>
                                            )}
                                        </div>
                                        <div className="flex-1 overflow-y-auto custom-scrollbar w-full">
                                            {notifications.length === 0 ? (
                                                <div className="px-4 py-8 text-center text-slate-400 text-sm">
                                                    Aucune notification
                                                </div>
                                            ) : (
                                                notifications.map(notif => (
                                                    <div
                                                        key={notif.id}
                                                        onClick={() => handleQuickRead(notif.id, notif.link)}
                                                        className={`px-4 py-3 border-b border-light/50 last:border-0 cursor-pointer transition-colors hover:bg-slate-50 w-full ${!notif.is_read ? 'bg-[#3A9AFF]/5' : ''}`}
                                                    >
                                                        <div className="flex justify-between items-start mb-1 w-full">
                                                            <p className={`text-xs font-bold ${!notif.is_read ? 'text-[#1C0770]' : 'text-slate-600'}`}>{notif.title}</p>
                                                            <span className="text-[10px] text-slate-400 shrink-0 ml-2">
                                                                {formatDistanceToNow(new Date(notif.created_at), { addSuffix: true, locale: fr })}
                                                            </span>
                                                        </div>
                                                        <p className="text-[11px] text-slate-500 leading-snug truncate w-full break-normal whitespace-normal">{notif.message}</p>
                                                    </div>
                                                ))
                                            )}
                                        </div>
                                    </div>
                                </>
                            )}
                        </div>

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

                                <div className="absolute right-0 mt-2 w-48 bg-white border border-slate-100 rounded-2xl shadow-2xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 transform origin-top-right py-2 z-50">
                                    <Link
                                        to="/admin/profile"
                                        className="w-full flex items-center gap-3 px-4 py-2.5 text-slate-700 hover:bg-slate-50 transition-colors text-sm font-bold"
                                    >
                                        <UserCog className="w-4 h-4" />
                                        Mon Profil
                                    </Link>
                                    <hr className="my-1 border-slate-100" />
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
