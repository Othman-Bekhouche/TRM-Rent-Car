export default function About() {
    return (
        <div className="pt-8 pb-24">
            {/* Header */}
            <div className="bg-[var(--color-surface)] py-20 border-b border-[var(--color-surface-light)] mb-16 relative overflow-hidden">
                <div className="absolute inset-0 opacity-20 bg-[url('https://images.unsplash.com/photo-1503376710356-748af20b66b7?auto=format&fit=crop&q=80')] bg-cover bg-center" />
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10">
                    <h1 className="text-4xl md:text-6xl font-extrabold text-white mb-6">L'Excellence Automobile</h1>
                    <p className="text-xl text-slate-300 max-w-3xl mx-auto">
                        Chez <span className="text-[var(--color-primary)] font-bold">TRM Rent Car</span>, nous redéfinissons les standards de la location de véhicules premium pour vous offrir bien plus qu'un simple déplacement : une véritable expérience.
                    </p>
                </div>
            </div>

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-16 items-center">
                    <div>
                        <h2 className="text-3xl font-bold text-white mb-6">Notre Histoire & Valeurs</h2>
                        <div className="space-y-6 text-lg text-slate-400">
                            <p>
                                Fondée sur une passion indéniable pour l'automobile d'exception, notre agence s'est donnée pour mission de rendre accessible le luxe et le confort aux professionnels comme aux particuliers exigeants.
                            </p>
                            <p>
                                Chaque véhicule de notre flotte est minutieusement inspecté, entretenu et préparé avant de vous être confié. Nous ne faisons aucun compromis sur la sécurité et l'hygiène de nos habitacles.
                            </p>
                            <p>
                                La transparence, la flexibilité et la satisfaction client sont les piliers de notre développement.
                            </p>
                        </div>

                        <div className="mt-10 grid grid-cols-2 gap-6">
                            <div className="border-l-4 border-[var(--color-primary)] pl-4">
                                <span className="block text-4xl font-extrabold text-white">20+</span>
                                <span className="text-slate-400 text-sm">Véhicules de luxe récents</span>
                            </div>
                            <div className="border-l-4 border-[var(--color-primary)] pl-4">
                                <span className="block text-4xl font-extrabold text-white">100%</span>
                                <span className="text-slate-400 text-sm">Satisfaction garantie</span>
                            </div>
                        </div>
                    </div>

                    <div className="relative">
                        <div className="absolute -inset-4 bg-[var(--color-primary)] opacity-20 blur-2xl rounded-[3rem]" />
                        <img
                            src="https://images.unsplash.com/photo-1606016159991-e44b8ee7bc6d?auto=format&fit=crop&q=80"
                            alt="TRM Rent Car Premium Service"
                            className="relative w-full rounded-2xl border border-[var(--color-surface-light)] shadow-2xl"
                        />
                    </div>
                </div>
            </div>
        </div>
    );
}
