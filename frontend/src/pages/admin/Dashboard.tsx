import { Car, Users, Calendar, DollarSign, ArrowUpRight, Clock } from 'lucide-react';

export default function Dashboard() {
    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-black text-white tracking-widest uppercase">Tableau de bord</h1>
                    <p className="text-[var(--color-text-muted)] text-sm mt-1">Vue d'ensemble de votre flotte TRM Rent Car</p>
                </div>
                <div className="flex gap-2">
                    <button className="px-4 py-2 bg-[var(--color-card)] border border-[var(--color-border)] text-sm font-bold text-white uppercase tracking-widest hover:bg-[var(--color-surface)] transition-colors rounded-sm">
                        Rapport Mensuel
                    </button>
                    <button className="px-4 py-2 bg-gradient-gold text-sm font-bold text-slate-900 uppercase tracking-widest hover:opacity-90 transition-opacity rounded-sm shadow-lg">
                        + Nouvelle Réservation
                    </button>
                </div>
            </div>

            {/* KPI Cards CRM Style */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <div className="bg-[var(--color-card)] p-6 rounded-sm border border-[var(--color-border)] relative overflow-hidden group">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-[var(--color-primary)]/5 rounded-bl-full -mr-8 -mt-8 transition-transform group-hover:scale-110" />
                    <div className="flex items-center justify-between mb-4">
                        <p className="text-[var(--color-text-muted)] text-xs font-bold tracking-widest uppercase">Revenus (Ce mois)</p>
                        <div className="bg-[var(--color-background)] p-2 rounded-sm border border-[var(--color-primary)]/20 text-[var(--color-primary)]">
                            <DollarSign className="h-5 w-5" />
                        </div>
                    </div>
                    <div>
                        <p className="text-3xl font-black text-white">45 200</p>
                        <div className="flex items-center mt-2 text-emerald-400 text-xs font-bold bg-emerald-400/10 w-fit px-2 py-1 rounded-sm">
                            <ArrowUpRight className="w-3 h-3 mr-1" />
                            +12.5% vs mois dernier
                        </div>
                    </div>
                </div>

                <div className="bg-[var(--color-card)] p-6 rounded-sm border border-[var(--color-border)] relative overflow-hidden group">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-[var(--color-primary)]/5 rounded-bl-full -mr-8 -mt-8 transition-transform group-hover:scale-110" />
                    <div className="flex items-center justify-between mb-4">
                        <p className="text-[var(--color-text-muted)] text-xs font-bold tracking-widest uppercase">Réservations Actives</p>
                        <div className="bg-[var(--color-background)] p-2 rounded-sm border border-blue-500/20 text-blue-400">
                            <Calendar className="h-5 w-5" />
                        </div>
                    </div>
                    <div>
                        <p className="text-3xl font-black text-white">18</p>
                        <div className="flex items-center mt-2 text-[var(--color-text-muted)] text-xs font-medium">
                            <Clock className="w-3 h-3 mr-1" />
                            3 en attente de validation
                        </div>
                    </div>
                </div>

                <div className="bg-[var(--color-card)] p-6 rounded-sm border border-[var(--color-border)] relative overflow-hidden group">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-[var(--color-primary)]/5 rounded-bl-full -mr-8 -mt-8 transition-transform group-hover:scale-110" />
                    <div className="flex items-center justify-between mb-4">
                        <p className="text-[var(--color-text-muted)] text-xs font-bold tracking-widest uppercase">Flotte Disponibilité</p>
                        <div className="bg-[var(--color-background)] p-2 rounded-sm border border-emerald-500/20 text-emerald-400">
                            <Car className="h-5 w-5" />
                        </div>
                    </div>
                    <div>
                        <p className="text-3xl font-black text-white">8<span className="text-lg text-[var(--color-text-muted)]"> / 24</span></p>
                        <div className="flex w-full h-1.5 bg-[var(--color-background)] rounded-full mt-3 overflow-hidden">
                            <div className="bg-emerald-500 w-1/3 h-full rounded-full" />
                        </div>
                    </div>
                </div>

                <div className="bg-[var(--color-card)] p-6 rounded-sm border border-[var(--color-border)] relative overflow-hidden group">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-[var(--color-primary)]/5 rounded-bl-full -mr-8 -mt-8 transition-transform group-hover:scale-110" />
                    <div className="flex items-center justify-between mb-4">
                        <p className="text-[var(--color-text-muted)] text-xs font-bold tracking-widest uppercase">Nouveaux Clients</p>
                        <div className="bg-[var(--color-background)] p-2 rounded-sm border border-purple-500/20 text-purple-400">
                            <Users className="h-5 w-5" />
                        </div>
                    </div>
                    <div>
                        <p className="text-3xl font-black text-white">42</p>
                        <div className="flex items-center mt-2 text-emerald-400 text-xs font-bold bg-emerald-400/10 w-fit px-2 py-1 rounded-sm">
                            <ArrowUpRight className="w-3 h-3 mr-1" />
                            +5% ce mois
                        </div>
                    </div>
                </div>
            </div>

            {/* Recent Bookings Table Style CRM */}
            <div className="mt-8 bg-[var(--color-card)] rounded-sm border border-[var(--color-border)] overflow-hidden">
                <div className="p-6 border-b border-[var(--color-border)] flex justify-between items-center">
                    <h2 className="text-sm font-bold text-white tracking-widest uppercase">Réservations Récentes</h2>
                    <button className="text-[var(--color-primary)] text-xs font-bold hover:underline">Tout voir</button>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-[#151a24] text-[var(--color-text-muted)] text-xs uppercase tracking-widest font-bold">
                                <th className="p-4 border-b border-[#2b3548]">ID</th>
                                <th className="p-4 border-b border-[#2b3548]">Client</th>
                                <th className="p-4 border-b border-[#2b3548]">Véhicule</th>
                                <th className="p-4 border-b border-[#2b3548]">Dates</th>
                                <th className="p-4 border-b border-[#2b3548]">Statut</th>
                                <th className="p-4 border-b border-[#2b3548] text-right">Montant</th>
                            </tr>
                        </thead>
                        <tbody className="text-sm">
                            <tr className="hover:bg-[#151a24] transition-colors border-b border-[#2b3548]">
                                <td className="p-4 text-slate-400 font-mono text-xs">#RES-2026</td>
                                <td className="p-4 text-white font-medium">Mohammed Alaoui</td>
                                <td className="p-4 text-slate-300">Dacia Logan 2026</td>
                                <td className="p-4 text-slate-400">12 Mar - 15 Mar</td>
                                <td className="p-4">
                                    <span className="bg-amber-500/10 text-amber-500 border border-amber-500/20 px-2 py-1 rounded-sm text-xs font-bold uppercase">En attente</span>
                                </td>
                                <td className="p-4 text-right font-bold text-white">900 MAD</td>
                            </tr>
                            <tr className="hover:bg-[#151a24] transition-colors border-b border-[#2b3548]">
                                <td className="p-4 text-slate-400 font-mono text-xs">#RES-2025</td>
                                <td className="p-4 text-white font-medium">Sophie Martin</td>
                                <td className="p-4 text-slate-300">Peugeot 208</td>
                                <td className="p-4 text-slate-400">10 Mar - 12 Mar</td>
                                <td className="p-4">
                                    <span className="bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 px-2 py-1 rounded-sm text-xs font-bold uppercase">Confirmé</span>
                                </td>
                                <td className="p-4 text-right font-bold text-white">600 MAD</td>
                            </tr>
                            <tr className="hover:bg-[#151a24] transition-colors">
                                <td className="p-4 text-slate-400 font-mono text-xs">#RES-2024</td>
                                <td className="p-4 text-white font-medium">Hassan Benali</td>
                                <td className="p-4 text-slate-300">Mercedes Classe C</td>
                                <td className="p-4 text-slate-400">08 Mar - 15 Mar</td>
                                <td className="p-4">
                                    <span className="bg-blue-500/10 text-blue-400 border border-blue-500/20 px-2 py-1 rounded-sm text-xs font-bold uppercase">En cours</span>
                                </td>
                                <td className="p-4 text-right font-bold text-white">10 500 MAD</td>
                            </tr>
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}
