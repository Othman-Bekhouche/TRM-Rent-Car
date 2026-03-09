import { Save, Building2, Phone, Mail, MapPin, Globe, CreditCard, Bell } from 'lucide-react';
import { useState } from 'react';

export default function Settings() {
    const [saved, setSaved] = useState(false);

    const handleSave = () => {
        setSaved(true);
        setTimeout(() => setSaved(false), 2000);
    };

    return (
        <div className="space-y-6 animate-[fadeIn_0.5s_ease-out]">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h1 className="text-3xl font-black text-[#1C0770] tracking-tight">Paramètres</h1>
                    <p className="text-slate-500 text-sm mt-1">Configuration de la plateforme TRM Rent Car</p>
                </div>
                <button
                    onClick={handleSave}
                    className={`flex items-center gap-2 px-5 py-2.5 text-sm font-bold rounded-xl transition-all ${saved
                        ? 'bg-emerald-500 text-white shadow-[0_6px_20px_rgba(16,185,129,0.4)]'
                        : 'bg-gradient-to-r from-[#261CC1] to-[#3A9AFF] text-white hover:shadow-[0_6px_20px_rgba(58,154,255,0.4)]'
                        }`}
                >
                    <Save className="w-4 h-4" /> {saved ? 'Sauvegardé !' : 'Enregistrer'}
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
                            <input type="text" defaultValue="TRM Rent Car" className="w-full bg-[#F0F4FF] border border-slate-200 text-slate-800 rounded-xl p-3 text-sm focus:ring-[#3A9AFF] focus:border-[#3A9AFF]" />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2 flex items-center gap-1"><Phone className="w-3 h-3" /> Téléphone</label>
                                <input type="text" defaultValue="06 06 06 6426" className="w-full bg-[#F0F4FF] border border-slate-200 text-slate-800 rounded-xl p-3 text-sm focus:ring-[#3A9AFF] focus:border-[#3A9AFF]" />
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2 flex items-center gap-1"><Mail className="w-3 h-3" /> Email</label>
                                <input type="email" defaultValue="trm.rentcar@gmail.com" className="w-full bg-[#F0F4FF] border border-slate-200 text-slate-800 rounded-xl p-3 text-sm focus:ring-[#3A9AFF] focus:border-[#3A9AFF]" />
                            </div>
                        </div>
                        <div>
                            <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2 flex items-center gap-1"><MapPin className="w-3 h-3" /> Adresse</label>
                            <textarea defaultValue="Appt Sabrine 2éme Etage N°6 Bloc A, 65800 Taourirt" className="w-full bg-[#F0F4FF] border border-slate-200 text-slate-800 rounded-xl p-3 text-sm focus:ring-[#3A9AFF] focus:border-[#3A9AFF] h-20 resize-none" />
                        </div>
                        <div>
                            <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2 flex items-center gap-1"><Globe className="w-3 h-3" /> Site Web</label>
                            <input type="text" defaultValue="www.trmrentcar.ma" className="w-full bg-[#F0F4FF] border border-slate-200 text-slate-800 rounded-xl p-3 text-sm focus:ring-[#3A9AFF] focus:border-[#3A9AFF]" />
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
                                    <input type="number" defaultValue={3000} className="w-full bg-[#F0F4FF] border border-slate-200 text-slate-800 rounded-xl p-3 text-sm focus:ring-[#3A9AFF] focus:border-[#3A9AFF]" />
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Frais Livraison (MAD)</label>
                                    <input type="number" defaultValue={100} className="w-full bg-[#F0F4FF] border border-slate-200 text-slate-800 rounded-xl p-3 text-sm focus:ring-[#3A9AFF] focus:border-[#3A9AFF]" />
                                </div>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Réduction Semaine (%)</label>
                                    <input type="number" defaultValue={10} className="w-full bg-[#F0F4FF] border border-slate-200 text-slate-800 rounded-xl p-3 text-sm focus:ring-[#3A9AFF] focus:border-[#3A9AFF]" />
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Réduction Mois (%)</label>
                                    <input type="number" defaultValue={20} className="w-full bg-[#F0F4FF] border border-slate-200 text-slate-800 rounded-xl p-3 text-sm focus:ring-[#3A9AFF] focus:border-[#3A9AFF]" />
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
                                <span className="text-sm font-medium text-slate-700">Email à chaque réservation</span>
                                <input type="checkbox" defaultChecked className="w-5 h-5 text-[#261CC1] focus:ring-[#3A9AFF] border-slate-300 rounded" />
                            </label>
                            <label className="flex items-center justify-between p-3 bg-[#F0F4FF] rounded-xl cursor-pointer border border-slate-100 hover:border-[#3A9AFF]/30 transition-colors">
                                <span className="text-sm font-medium text-slate-700">Alerte maintenance véhicule</span>
                                <input type="checkbox" defaultChecked className="w-5 h-5 text-[#261CC1] focus:ring-[#3A9AFF] border-slate-300 rounded" />
                            </label>
                            <label className="flex items-center justify-between p-3 bg-[#F0F4FF] rounded-xl cursor-pointer border border-slate-100 hover:border-[#3A9AFF]/30 transition-colors">
                                <span className="text-sm font-medium text-slate-700">Rapport financier mensuel</span>
                                <input type="checkbox" className="w-5 h-5 text-[#261CC1] focus:ring-[#3A9AFF] border-slate-300 rounded" />
                            </label>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
