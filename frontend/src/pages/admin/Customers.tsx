import { Users, Search, Download } from 'lucide-react';

export default function Customers() {
    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <h1 className="text-3xl font-black text-white tracking-widest uppercase">Base Clients</h1>
                    <p className="text-[var(--color-text-muted)] text-sm mt-1">Gérez la relation client et l'historique des réservations</p>
                </div>
                <button className="flex items-center gap-2 px-4 py-2 bg-[var(--color-card)] text-sm font-bold text-white uppercase tracking-widest hover:bg-[var(--color-surface)] border border-[var(--color-border)] transition-colors rounded-sm shadow-sm">
                    <Download className="w-4 h-4" /> Exporter
                </button>
            </div>

            <div className="bg-[var(--color-card)] rounded-sm border border-[var(--color-border)] p-4">
                <div className="flex flex-col md:flex-row gap-4 justify-between items-center mb-6">
                    <div className="relative w-full md:w-96">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                        <input
                            type="text"
                            placeholder="Rechercher nom, email, téléphone..."
                            className="w-full bg-[var(--color-background)] border border-[var(--color-border)] text-white text-sm rounded-sm focus:ring-[var(--color-primary)] focus:border-[var(--color-primary)] block pl-10 p-2.5 transition-colors"
                        />
                    </div>
                </div>

                <div className="flex items-center justify-center p-24 border-2 border-dashed border-[var(--color-border)] rounded-sm bg-[var(--color-background)]/50">
                    <div className="text-center">
                        <Users className="w-12 h-12 text-[var(--color-border)] mx-auto mb-4" />
                        <p className="text-slate-400 font-medium">Tableau liste clients à implémenter</p>
                    </div>
                </div>
            </div>
        </div>
    );
}
