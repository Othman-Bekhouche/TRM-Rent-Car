import { Calculator, Download } from 'lucide-react';

export default function Accounting() {
    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <h1 className="text-3xl font-black text-white tracking-widest uppercase">Comptabilité</h1>
                    <p className="text-[var(--color-text-muted)] text-sm mt-1">Suivi financier et chiffre d'affaires</p>
                </div>
                <button className="flex items-center gap-2 px-4 py-2 bg-[var(--color-card)] text-sm font-bold text-white uppercase tracking-widest hover:bg-[var(--color-surface)] border border-[var(--color-border)] transition-colors rounded-sm shadow-sm">
                    <Download className="w-4 h-4" /> Bilan Mensuel
                </button>
            </div>

            <div className="bg-[var(--color-card)] rounded-sm border border-[var(--color-border)] p-4">
                <div className="flex items-center justify-center p-24 border-2 border-dashed border-[var(--color-border)] rounded-sm bg-[var(--color-background)]/50">
                    <div className="text-center">
                        <Calculator className="w-12 h-12 text-[var(--color-border)] mx-auto mb-4" />
                        <p className="text-slate-400 font-medium">Module de facturation et encaissements à développer</p>
                    </div>
                </div>
            </div>
        </div>
    );
}
