import { MapPin } from 'lucide-react';

export default function GPS() {
    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <h1 className="text-3xl font-black text-white tracking-widest uppercase">Suivi GPS</h1>
                    <p className="text-[var(--color-text-muted)] text-sm mt-1">Localisez votre flotte en temps réel (Intégration future)</p>
                </div>
            </div>

            <div className="bg-[var(--color-card)] rounded-sm border border-[var(--color-border)] p-4 h-[600px] flex items-center justify-center">
                <div className="text-center">
                    <div className="w-20 h-20 mx-auto bg-[var(--color-primary)]/10 rounded-full flex items-center justify-center mb-6">
                        <MapPin className="w-10 h-10 text-[var(--color-primary)] animate-pulse" />
                    </div>
                    <h2 className="text-xl font-bold text-white mb-2 uppercase tracking-wide">Carte Interactive (Bientôt disponible)</h2>
                    <p className="text-slate-400 max-w-md mx-auto">
                        Cette interface permettra de suivre tous les véhicules loués en temps réel sur le territoire marocain afin de prévenir les vols et optimiser la gestion de flotte.
                    </p>
                </div>
            </div>
        </div>
    );
}
