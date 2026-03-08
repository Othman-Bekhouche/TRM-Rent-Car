import { Car, Users, Calendar, DollarSign } from 'lucide-react';

export default function Dashboard() {
    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <h1 className="text-2xl font-bold text-white">Vue d'ensemble</h1>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <div className="bg-[var(--color-surface)] p-6 rounded-xl border border-[var(--color-surface-light)]">
                    <div className="flex items-center justify-between space-x-4">
                        <div>
                            <p className="text-slate-400 text-sm font-medium">Revenus (Mensuels)</p>
                            <p className="text-2xl font-bold text-white mt-1">12 450 MAD</p>
                        </div>
                        <div className="bg-amber-500/10 p-3 rounded-lg">
                            <DollarSign className="h-6 w-6 text-[var(--color-primary)]" />
                        </div>
                    </div>
                </div>

                <div className="bg-[var(--color-surface)] p-6 rounded-xl border border-[var(--color-surface-light)]">
                    <div className="flex items-center justify-between space-x-4">
                        <div>
                            <p className="text-slate-400 text-sm font-medium">Réservations Actives</p>
                            <p className="text-2xl font-bold text-white mt-1">14</p>
                        </div>
                        <div className="bg-amber-500/10 p-3 rounded-lg">
                            <Calendar className="h-6 w-6 text-[var(--color-primary)]" />
                        </div>
                    </div>
                </div>

                <div className="bg-[var(--color-surface)] p-6 rounded-xl border border-[var(--color-surface-light)]">
                    <div className="flex items-center justify-between space-x-4">
                        <div>
                            <p className="text-slate-400 text-sm font-medium">Véhicules Disponibles</p>
                            <p className="text-2xl font-bold text-white mt-1">8 / 22</p>
                        </div>
                        <div className="bg-amber-500/10 p-3 rounded-lg">
                            <Car className="h-6 w-6 text-[var(--color-primary)]" />
                        </div>
                    </div>
                </div>

                <div className="bg-[var(--color-surface)] p-6 rounded-xl border border-[var(--color-surface-light)]">
                    <div className="flex items-center justify-between space-x-4">
                        <div>
                            <p className="text-slate-400 text-sm font-medium">Nouveaux Clients</p>
                            <p className="text-2xl font-bold text-white mt-1">28</p>
                        </div>
                        <div className="bg-amber-500/10 p-3 rounded-lg">
                            <Users className="h-6 w-6 text-[var(--color-primary)]" />
                        </div>
                    </div>
                </div>
            </div>

            <div className="mt-8 bg-[var(--color-surface)] rounded-xl border border-[var(--color-surface-light)] p-6">
                <h2 className="text-lg font-bold text-white mb-4">Réservations Récentes</h2>
                <div className="flex items-center justify-center p-12 border-2 border-dashed border-[var(--color-surface-light)] rounded-xl">
                    <p className="text-slate-400">Tableau des réservations à implémenter...</p>
                </div>
            </div>
        </div>
    );
}
