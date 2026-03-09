import { Save, Building2, Phone, Mail, MapPin, Globe, CreditCard, Bell, Loader2 } from 'lucide-react';
import { useState, useEffect } from 'react';
import toast, { Toaster } from 'react-hot-toast';
import { settingsApi } from '../../lib/api';

export default function Settings() {
    const [saved, setSaved] = useState(false);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [settings, setSettings] = useState<any>(null);

    useEffect(() => {
        const loadSettings = async () => {
            try {
                const data = await settingsApi.get();
                setSettings(data);
            } catch (err) {
                toast.error('Erreur lors du chargement des paramètres.');
            } finally {
                setLoading(false);
            }
        };
        loadSettings();
    }, []);

    const handleSave = async () => {
        if (!settings) return;
        setSaving(true);
        try {
            const dataToUpdate = { ...settings };
            delete dataToUpdate.id;
            delete dataToUpdate.created_at;
            delete dataToUpdate.updated_at;

            await settingsApi.update(dataToUpdate);
            setSaved(true);
            toast.success('Paramètres sauvegardés avec succès !');
            setTimeout(() => setSaved(false), 2000);
        } catch (err) {
            toast.error('Erreur lors de la sauvegarde.');
        } finally {
            setSaving(false);
        }
    };

    if (loading) {
        return <div className="p-8 flex justify-center"><Loader2 className="w-8 h-8 animate-spin text-[#3A9AFF]" /></div>;
    }

    if (!settings) return null;

    return (
        <div className="space-y-6 animate-[fadeIn_0.5s_ease-out]">
            <Toaster position="top-center" />
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h1 className="text-3xl font-black text-[#1C0770] tracking-tight">Paramètres</h1>
                    <p className="text-slate-500 text-sm mt-1">Configuration de la plateforme TRM Rent Car</p>
                </div>
                <button
                    onClick={handleSave}
                    disabled={saving}
                    className={`flex items-center gap-2 px-5 py-2.5 text-sm font-bold rounded-xl transition-all ${saved
                        ? 'bg-emerald-500 text-white shadow-[0_6px_20px_rgba(16,185,129,0.4)]'
                        : 'bg-gradient-to-r from-[#261CC1] to-[#3A9AFF] text-white hover:shadow-[0_6px_20px_rgba(58,154,255,0.4)]'
                        } disabled:opacity-50`}
                >
                    {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                    {saved ? 'Sauvegardé !' : 'Enregistrer'}
                </button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Company Info */}
                <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
                    <div className="p-6 border-b border-slate-100 flex items-center gap-3">
                        <div className="p-2 bg-[#261CC1]/10 rounded-xl"><Building2 className="w-5 h-5 text-[#261CC1]" /></div>
                        <h2 className="font-bold text-[#1C0770]">Informations Agence</h2>
                    </div>
                    <div className="p-6 space-y-5">
                        <div>
                            <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Nom de l'agence</label>
                            <input type="text" value={settings.company_name || ''} onChange={e => setSettings({ ...settings, company_name: e.target.value })} className="w-full bg-[#F0F4FF] border border-slate-200 text-slate-800 rounded-xl p-3 text-sm focus:ring-[#3A9AFF] focus:border-[#3A9AFF]" />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2 flex items-center gap-1"><Phone className="w-3 h-3" /> Téléphone</label>
                                <input type="text" value={settings.phone || ''} onChange={e => setSettings({ ...settings, phone: e.target.value })} className="w-full bg-[#F0F4FF] border border-slate-200 text-slate-800 rounded-xl p-3 text-sm focus:ring-[#3A9AFF] focus:border-[#3A9AFF]" />
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2 flex items-center gap-1"><Mail className="w-3 h-3" /> Email</label>
                                <input type="email" value={settings.email || ''} onChange={e => setSettings({ ...settings, email: e.target.value })} className="w-full bg-[#F0F4FF] border border-slate-200 text-slate-800 rounded-xl p-3 text-sm focus:ring-[#3A9AFF] focus:border-[#3A9AFF]" />
                            </div>
                        </div>
                        <div>
                            <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2 flex items-center gap-1"><MapPin className="w-3 h-3" /> Adresse</label>
                            <textarea value={settings.address || ''} onChange={e => setSettings({ ...settings, address: e.target.value })} className="w-full bg-[#F0F4FF] border border-slate-200 text-slate-800 rounded-xl p-3 text-sm focus:ring-[#3A9AFF] focus:border-[#3A9AFF] h-20 resize-none" />
                        </div>
                        <div>
                            <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2 flex items-center gap-1"><Globe className="w-3 h-3" /> Site Web</label>
                            <input type="text" value={settings.website || ''} onChange={e => setSettings({ ...settings, website: e.target.value })} className="w-full bg-[#F0F4FF] border border-slate-200 text-slate-800 rounded-xl p-3 text-sm focus:ring-[#3A9AFF] focus:border-[#3A9AFF]" />
                        </div>
                    </div>
                </div>

                {/* Tariffs & Policies */}
                <div className="space-y-6">
                    <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
                        <div className="p-6 border-b border-slate-100 flex items-center gap-3">
                            <div className="p-2 bg-emerald-50 rounded-xl"><CreditCard className="w-5 h-5 text-emerald-600" /></div>
                            <h2 className="font-bold text-[#1C0770]">Tarification</h2>
                        </div>
                        <div className="p-6 space-y-5">
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Caution Min. (MAD)</label>
                                    <input type="number" value={settings.base_deposit || 0} onChange={e => setSettings({ ...settings, base_deposit: Number(e.target.value) })} className="w-full bg-[#F0F4FF] border border-slate-200 text-slate-800 rounded-xl p-3 text-sm focus:ring-[#3A9AFF] focus:border-[#3A9AFF]" />
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Frais Livraison (MAD)</label>
                                    <input type="number" value={settings.delivery_fee || 0} onChange={e => setSettings({ ...settings, delivery_fee: Number(e.target.value) })} className="w-full bg-[#F0F4FF] border border-slate-200 text-slate-800 rounded-xl p-3 text-sm focus:ring-[#3A9AFF] focus:border-[#3A9AFF]" />
                                </div>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Réduction Semaine (%)</label>
                                    <input type="number" value={settings.discount_week || 0} onChange={e => setSettings({ ...settings, discount_week: Number(e.target.value) })} className="w-full bg-[#F0F4FF] border border-slate-200 text-slate-800 rounded-xl p-3 text-sm focus:ring-[#3A9AFF] focus:border-[#3A9AFF]" />
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Réduction Mois (%)</label>
                                    <input type="number" value={settings.discount_month || 0} onChange={e => setSettings({ ...settings, discount_month: Number(e.target.value) })} className="w-full bg-[#F0F4FF] border border-slate-200 text-slate-800 rounded-xl p-3 text-sm focus:ring-[#3A9AFF] focus:border-[#3A9AFF]" />
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
                        <div className="p-6 border-b border-slate-100 flex items-center gap-3">
                            <div className="p-2 bg-[#261CC1]/10 rounded-xl"><Bell className="w-5 h-5 text-[#261CC1]" /></div>
                            <h2 className="font-bold text-[#1C0770]">Notifications</h2>
                        </div>
                        <div className="p-6 space-y-4">
                            <label className="flex items-center justify-between p-3 bg-[#F0F4FF] rounded-xl cursor-pointer border border-slate-100 hover:border-[#3A9AFF]/30 transition-colors">
                                <span className="text-sm font-medium text-slate-700">Notifications par Email</span>
                                <input type="checkbox" checked={!!settings.notifications_email} onChange={e => setSettings({ ...settings, notifications_email: e.target.checked })} className="w-5 h-5 text-[#261CC1] focus:ring-[#3A9AFF] border-slate-300 rounded" />
                            </label>
                            <label className="flex items-center justify-between p-3 bg-[#F0F4FF] rounded-xl cursor-pointer border border-slate-100 hover:border-[#3A9AFF]/30 transition-colors">
                                <span className="text-sm font-medium text-slate-700">Notifications par SMS (Bientôt)</span>
                                <input type="checkbox" checked={!!settings.notifications_sms} onChange={e => setSettings({ ...settings, notifications_sms: e.target.checked })} className="w-5 h-5 text-[#261CC1] focus:ring-[#3A9AFF] border-slate-300 rounded" />
                            </label>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
