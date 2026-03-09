import { Settings as SettingsIcon } from 'lucide-react';

export default function Settings() {
    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <h1 className="text-3xl font-black text-white tracking-widest uppercase">Paramètres</h1>
                    <p className="text-[var(--color-text-muted)] text-sm mt-1">Configuration de la plateforme TRM Rent Car</p>
                </div>
            </div>

            <div className="bg-[var(--color-card)] rounded-sm border border-[var(--color-border)] p-4">
                <div className="flex items-center justify-center p-24 border-2 border-dashed border-[var(--color-border)] rounded-sm bg-[var(--color-background)]/50">
                    <div className="text-center">
                        <SettingsIcon className="w-12 h-12 text-[var(--color-border)] mx-auto mb-4" />
                        <p className="text-slate-400 font-medium">Panneau de configuration (Tarifs, Marges, Agences, Infos Contact)</p>
                    </div>
                </div>
            </div>
        </div>
    );
}
