import { CalendarDays, Filter, Plus, Search } from 'lucide-react';

export default function Reservations() {
    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <h1 className="text-3xl font-black text-white tracking-widest uppercase">Réservations</h1>
                    <p className="text-[var(--color-text-muted)] text-sm mt-1">Gérez toutes les locations et demandes en cours</p>
                </div>
                <button className="flex items-center gap-2 px-4 py-2 bg-gradient-gold text-sm font-bold text-slate-900 uppercase tracking-widest hover:opacity-90 transition-opacity rounded-sm shadow-lg">
                    <Plus className="w-4 h-4" /> Nouvelle Réservation
                </button>
            </div>

            <div className="bg-[var(--color-card)] rounded-sm border border-[var(--color-border)] p-4">
                <div className="flex flex-col md:flex-row gap-4 justify-between items-center mb-6">
                    <div className="relative w-full md:w-96">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                        <input
                            type="text"
                            placeholder="Rechercher par n° de résa, client..."
                            className="w-full bg-[var(--color-background)] border border-[var(--color-border)] text-white text-sm rounded-sm focus:ring-[var(--color-primary)] focus:border-[var(--color-primary)] block pl-10 p-2.5 transition-colors"
                        />
                    </div>
                    <div className="flex gap-2 w-full md:w-auto">
                        <button className="flex items-center justify-center flex-1 md:flex-none gap-2 px-4 py-2 bg-[var(--color-background)] border border-[var(--color-border)] text-sm font-bold text-white uppercase tracking-widest hover:border-[var(--color-primary)] transition-colors rounded-sm">
                            <Filter className="w-4 h-4" /> Filtres
                        </button>
                        <select className="flex-1 md:flex-none bg-[var(--color-background)] border border-[var(--color-border)] text-white text-sm font-bold uppercase tracking-widest rounded-sm focus:ring-[var(--color-primary)] focus:border-[var(--color-primary)] block p-2.5">
                            <option>Toutes (350)</option>
                            <option>En attente (12)</option>
                            <option>Confirmées (8)</option>
                            <option>En cours (5)</option>
                            <option>Terminées (325)</option>
                        </select>
                    </div>
                </div>

                <div className="flex items-center justify-center p-24 border-2 border-dashed border-[var(--color-border)] rounded-sm bg-[var(--color-background)]/50">
                    <div className="text-center">
                        <CalendarDays className="w-12 h-12 text-[var(--color-border)] mx-auto mb-4" />
                        <p className="text-slate-400 font-medium">Tableau dynamique des réservations à implémenter</p>
                    </div>
                </div>
            </div>
        </div>
    );
}
