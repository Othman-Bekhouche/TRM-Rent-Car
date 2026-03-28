import { useState, useEffect } from 'react';
import { Shield, Edit, Mail, Loader2, Check, Trash2, Plus } from 'lucide-react';
import { adminsApi, type AdminUser } from '../../lib/api';
import toast, { Toaster } from 'react-hot-toast';

const ROLES_INFO = [
    { name: 'super_admin', label: 'Super Admin', permissions: 'Accès complet — Toutes les fonctionnalités', color: 'bg-purple-50 text-purple-700 border-purple-200' },
    { name: 'admin', label: 'Admin', permissions: 'Véhicules, Réservations, Comptes', color: 'bg-blue-50 text-blue-700 border-blue-200' },
    { name: 'gestionnaire', label: 'Gestionnaire', permissions: 'Véhicules, Suivi GPS, Maintenance', color: 'bg-indigo-50 text-indigo-700 border-indigo-200' },
    { name: 'assistant', label: 'Assistant(e)', permissions: 'Réservations, Clients, Infractions', color: 'bg-emerald-50 text-emerald-700 border-emerald-200' },
];

export default function Users() {
    const [admins, setAdmins] = useState<AdminUser[]>([]);
    const [loading, setLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);
    const [showForm, setShowForm] = useState(false);
    const [selectedAdmin, setSelectedAdmin] = useState<AdminUser | null>(null);

    // Simplified form for role update (since creation happens via auth)
    const [formData, setFormData] = useState<Partial<AdminUser>>({
        full_name: '',
        role: 'admin'
    });

    useEffect(() => {
        loadAdmins();
    }, []);

    const loadAdmins = async () => {
        try {
            setLoading(true);
            const data = await adminsApi.getAll();
            setAdmins(data);
        } catch {
            toast.error("Erreur chargement administrateurs");
        } finally {
            setLoading(false);
        }
    };

    const handleEdit = (admin: AdminUser) => {
        setSelectedAdmin(admin);
        setFormData({
            full_name: admin.full_name,
            role: admin.role
        });
        setShowForm(true);
    };

    const handleDelete = async (id: string) => {
        if (!window.confirm("Supprimer cet administrateur ?")) return;
        try {
            await adminsApi.delete(id);
            setAdmins(prev => prev.filter(a => a.id !== id));
            toast.success("Administrateur supprimé");
        } catch {
            toast.error("Erreur suppression");
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!selectedAdmin) return;
        setIsSaving(true);
        try {
            const updated = await adminsApi.update(selectedAdmin.id, formData);
            setAdmins(prev => prev.map(a => a.id === updated.id ? updated : a));
            toast.success("Profil mis à jour");
            setShowForm(false);
        } catch (err: unknown) {
            const message = err instanceof Error ? err.message : "Erreur mise à jour";
            toast.error(message);
        } finally {
            setIsSaving(false);
        }
    };

    return (
        <div className="space-y-6 animate-[fadeIn_0.5s_ease-out]">
            <Toaster position="top-right" />

            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h1 className="text-3xl font-black text-[#1C0770] tracking-tight">Administrateurs</h1>
                    <p className="text-slate-500 text-sm mt-1">Gérez les accès et rôles de votre équipe</p>
                </div>
                <button onClick={() => toast.success("Utilisez l'invitation pour ajouter des membres")} className="flex items-center gap-2 px-5 py-2.5 bg-[#1C0770] text-sm font-bold text-white rounded-xl shadow-lg hover:shadow-[#1C0770]/20 transition-all">
                    <Plus className="w-4 h-4" /> Ajouter un admin
                </button>
            </div>

            {showForm && (
                <div className="bg-white rounded-2xl border border-slate-100 shadow-xl p-6 animate-[scaleIn_0.2s_ease-out]">
                    <h2 className="text-xl font-bold text-[#1C0770] mb-4">Modifier les droits : {selectedAdmin?.full_name}</h2>
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-2">Nom Complet</label>
                                <input type="text" value={formData.full_name} onChange={e => setFormData({ ...formData, full_name: e.target.value })} className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-sm text-slate-800" />
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-2">Rôle</label>
                                <select value={formData.role} onChange={e => setFormData({ ...formData, role: e.target.value })} className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-sm text-slate-800">
                                    <option value="admin">Admin</option>
                                    <option value="gestionnaire">Gestionnaire</option>
                                    <option value="assistant">Assistant(e)</option>
                                    <option value="super_admin">Super Admin</option>
                                </select>
                            </div>
                        </div>
                        <div className="flex justify-end gap-3 pt-4">
                            <button type="button" onClick={() => setShowForm(false)} className="px-6 py-2 text-slate-400 font-bold">Annuler</button>
                            <button type="submit" disabled={isSaving} className="px-8 py-2.5 bg-[#1C0770] text-white rounded-xl shadow-lg flex items-center gap-2 font-bold transition-all hover:scale-105 active:scale-95">
                                {isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />} Confirmer
                            </button>
                        </div>
                    </form>
                </div>
            )}

            {/* Roles */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {ROLES_INFO.map((role, i) => (
                    <div key={i} className="bg-white rounded-2xl p-5 border border-slate-100 shadow-sm transition-all hover:shadow-md">
                        <div className="flex items-center justify-between mb-3">
                            <span className={`${role.color} px-3 py-1.5 rounded-full text-[10px] font-black uppercase border tracking-widest`}>{role.label}</span>
                            <span className="text-lg font-black text-[#1C0770]">{admins.filter(a => a.role === role.name).length}</span>
                        </div>
                        <p className="text-xs text-slate-500 font-medium">{role.permissions}</p>
                    </div>
                ))}
            </div>

            {/* Admins Table */}
            <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
                <div className="p-6 border-b border-slate-100 flex items-center gap-3">
                    <div className="p-2 bg-[#261CC1]/10 rounded-xl"><Shield className="w-5 h-5 text-[#261CC1]" /></div>
                    <h2 className="font-bold text-[#1C0770]">Liste des Administrateurs</h2>
                </div>
                <div className="overflow-x-auto">
                    {loading ? (
                        <div className="py-20 flex flex-col items-center gap-3"><Loader2 className="animate-spin text-[#261CC1]" /><p className="text-slate-400 text-xs font-bold uppercase tracking-widest animate-pulse">Initialisation de la liste...</p></div>
                    ) : (
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="bg-[#F0F4FF] text-slate-400 text-[10px] uppercase tracking-[0.2em] font-black">
                                    <th className="p-4">Utilisateur</th>
                                    <th className="p-4">Rôle</th>
                                    <th className="p-4">Dernière connexion</th>
                                    <th className="p-4 text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="text-sm">
                                {admins.map((a) => {
                                    const role = ROLES_INFO.find(r => r.name === a.role) || ROLES_INFO[0];
                                    return (
                                        <tr key={a.id} className="hover:bg-[#F8FAFF] transition-colors border-b border-slate-50 group">
                                            <td className="p-4">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-10 h-10 bg-gradient-to-br from-[#1C0770] to-[#3A9AFF] rounded-full flex items-center justify-center text-white font-black text-xs shadow-lg transform group-hover:rotate-12 transition-transform">
                                                        {a.full_name[0].toUpperCase()}
                                                    </div>
                                                    <div>
                                                        <p className="font-bold text-slate-800">{a.full_name}</p>
                                                        <p className="text-[10px] text-slate-400 flex items-center gap-1 font-mono uppercase"><Mail className="w-3 h-3" />{a.email}</p>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="p-4">
                                                <span className={`px-2.5 py-1 rounded-full text-[10px] font-black uppercase border tracking-widest ${role.color}`}>{role.label}</span>
                                            </td>
                                            <td className="p-4 text-slate-400 text-[10px] uppercase font-bold">{new Date(a.created_at).toLocaleDateString()}</td>
                                            <td className="p-4 text-right">
                                                <div className="flex items-center justify-end gap-1">
                                                    <button onClick={() => handleEdit(a)} className="p-2 text-slate-300 hover:text-[#261CC1] hover:bg-[#261CC1]/10 rounded-lg transition-all"><Edit className="w-4 h-4" /></button>
                                                    <button onClick={() => handleDelete(a.id)} className="p-2 text-slate-300 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all"><Trash2 className="w-4 h-4" /></button>
                                                </div>
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    )}
                </div>
            </div>
        </div>
    );
}
