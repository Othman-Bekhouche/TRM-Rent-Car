import { useState, useEffect } from 'react';
import { User, Phone, Lock, Save, Loader2, ShieldCheck } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import toast, { Toaster } from 'react-hot-toast';

export default function Profile() {
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [userRole, setUserRole] = useState<string>('');
    const [profile, setProfile] = useState({
        id: '',
        email: '',
        full_name: '',
        phone: '',
    });
    const [passwordData, setPasswordData] = useState({
        newPassword: '',
        confirmPassword: ''
    });

    useEffect(() => {
        const loadProfile = async () => {
            try {
                const { data: { user } } = await supabase.auth.getUser();
                if (!user) return;

                const { data: profileData, error } = await supabase
                    .from('profiles')
                    .select('*')
                    .eq('id', user.id)
                    .single();

                if (error) throw error;

                setProfile({
                    id: user.id,
                    email: user.email || '',
                    full_name: profileData.full_name || '',
                    phone: profileData.phone || '',
                });
                setUserRole(profileData.role || 'Utilisateur');
            } catch (err: any) {
                toast.error('Erreur lors du chargement du profil');
            } finally {
                setLoading(false);
            }
        };
        loadProfile();
    }, []);

    const handleSaveProfile = async (e: React.FormEvent) => {
        e.preventDefault();
        setSaving(true);
        try {
            const { error } = await supabase
                .from('profiles')
                .update({
                    full_name: profile.full_name,
                    phone: profile.phone
                })
                .eq('id', profile.id);

            if (error) throw error;
            toast.success('Profil mis à jour avec succès');
        } catch (err) {
            toast.error('Erreur lors de la mise à jour du profil');
        } finally {
            setSaving(false);
        }
    };

    const handleUpdatePassword = async (e: React.FormEvent) => {
        e.preventDefault();
        if (passwordData.newPassword !== passwordData.confirmPassword) {
            toast.error('Les mots de passe ne correspondent pas');
            return;
        }

        setSaving(true);
        try {
            const { error } = await supabase.auth.updateUser({
                password: passwordData.newPassword
            });

            if (error) throw error;
            toast.success('Mot de passe mis à jour avec succès');
            setPasswordData({ newPassword: '', confirmPassword: '' });
        } catch (err: any) {
            toast.error(err.message || 'Erreur lors de la mise à jour du mot de passe');
        } finally {
            setSaving(false);
        }
    };

    if (loading) return <div className="p-8 flex justify-center"><Loader2 className="w-8 h-8 animate-spin text-[#3A9AFF]" /></div>;

    const getRoleBadgeColor = (role: string) => {
        switch (role) {
            case 'super_admin': return 'bg-purple-100 text-purple-700 border-purple-200';
            case 'admin': return 'bg-blue-100 text-blue-700 border-blue-200';
            case 'gestionnaire': return 'bg-indigo-100 text-indigo-700 border-indigo-200';
            case 'assistant': return 'bg-emerald-100 text-emerald-700 border-emerald-200';
            default: return 'bg-slate-100 text-slate-700 border-slate-200';
        }
    };

    return (
        <div className="space-y-6 animate-[fadeIn_0.5s_ease-out]">
            <Toaster position="top-center" />

            <div>
                <h1 className="text-3xl font-black text-[#1C0770] tracking-tight flex items-center gap-3">
                    Mon Profil
                    <span className={`text-xs px-2 py-1 rounded-md border font-bold uppercase tracking-wider ${getRoleBadgeColor(userRole)}`}>
                        {userRole.replace('_', ' ')}
                    </span>
                </h1>
                <p className="text-slate-500 text-sm mt-1">Gérez vos informations personnelles et votre sécurité</p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

                {/* Information de base */}
                <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden h-fit">
                    <div className="p-6 border-b border-slate-100 flex items-center gap-3">
                        <div className="p-2 bg-[#261CC1]/10 rounded-xl"><User className="w-5 h-5 text-[#261CC1]" /></div>
                        <h2 className="font-bold text-[#1C0770]">Informations Personnelles</h2>
                    </div>
                    <form onSubmit={handleSaveProfile} className="p-6 space-y-5">
                        <div>
                            <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Email (Non modifiable)</label>
                            <input type="email" value={profile.email} disabled className="w-full bg-slate-100 border border-slate-200 text-slate-500 rounded-xl p-3 text-sm cursor-not-allowed" />
                        </div>
                        <div>
                            <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Nom Complet</label>
                            <input
                                type="text"
                                required
                                value={profile.full_name}
                                onChange={e => setProfile({ ...profile, full_name: e.target.value })}
                                className="w-full bg-[#F0F4FF] border border-slate-200 text-slate-800 rounded-xl p-3 text-sm focus:ring-[#3A9AFF] focus:border-[#3A9AFF]"
                            />
                        </div>
                        <div>
                            <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2 flex items-center gap-1"><Phone className="w-3 h-3" /> Téléphone</label>
                            <input
                                type="text"
                                value={profile.phone}
                                onChange={e => setProfile({ ...profile, phone: e.target.value })}
                                className="w-full bg-[#F0F4FF] border border-slate-200 text-slate-800 rounded-xl p-3 text-sm focus:ring-[#3A9AFF] focus:border-[#3A9AFF]"
                            />
                        </div>

                        <div className="pt-2">
                            <button
                                type="submit"
                                disabled={saving}
                                className="w-full flex justify-center items-center gap-2 py-3 bg-gradient-to-r from-[#261CC1] to-[#3A9AFF] text-white font-bold rounded-xl hover:shadow-[0_6px_20px_rgba(58,154,255,0.4)] transition-all disabled:opacity-50"
                            >
                                {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                                Mettre à jour le profil
                            </button>
                        </div>
                    </form>
                </div>

                {/* Sécurité */}
                <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden h-fit">
                    <div className="p-6 border-b border-slate-100 flex items-center gap-3">
                        <div className="p-2 bg-amber-50 rounded-xl"><ShieldCheck className="w-5 h-5 text-amber-600" /></div>
                        <h2 className="font-bold text-[#1C0770]">Sécurité du compte</h2>
                    </div>
                    <form onSubmit={handleUpdatePassword} className="p-6 space-y-5">
                        <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 text-xs text-amber-800">
                            Assurez-vous de choisir un mot de passe fort contenant au moins 6 caractères pour protéger votre accès au système de gestion.
                        </div>
                        <div>
                            <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2 flex items-center gap-1"><Lock className="w-3 h-3" /> Nouveau mot de passe</label>
                            <input
                                type="password"
                                required
                                minLength={6}
                                value={passwordData.newPassword}
                                onChange={e => setPasswordData({ ...passwordData, newPassword: e.target.value })}
                                className="w-full bg-[#F0F4FF] border border-slate-200 text-slate-800 rounded-xl p-3 text-sm focus:ring-[#3A9AFF] focus:border-[#3A9AFF]"
                                placeholder="Min. 6 caractères"
                            />
                        </div>
                        <div>
                            <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2 flex items-center gap-1"><Lock className="w-3 h-3" /> Confirmer le mot de passe</label>
                            <input
                                type="password"
                                required
                                minLength={6}
                                value={passwordData.confirmPassword}
                                onChange={e => setPasswordData({ ...passwordData, confirmPassword: e.target.value })}
                                className="w-full bg-[#F0F4FF] border border-slate-200 text-slate-800 rounded-xl p-3 text-sm focus:ring-[#3A9AFF] focus:border-[#3A9AFF]"
                                placeholder="Retapez le mot de passe"
                            />
                        </div>

                        <div className="pt-2">
                            <button
                                type="submit"
                                disabled={saving}
                                className="w-full flex justify-center items-center gap-2 py-3 bg-white text-[#1C0770] border border-[#1C0770]/20 font-bold rounded-xl hover:bg-slate-50 transition-colors disabled:opacity-50"
                            >
                                {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Lock className="w-4 h-4" />}
                                Modifier le mot de passe
                            </button>
                        </div>
                    </form>
                </div>

            </div>
        </div>
    );
}
