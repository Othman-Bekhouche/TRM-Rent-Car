export default function Terms() {
    return (
        <div className="bg-[var(--color-background)] py-20 min-h-screen">
            <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="bg-[#141C2B] border border-[var(--color-border)] rounded-3xl p-8 md:p-12 shadow-2xl">
                    <h1 className="text-4xl md:text-5xl font-black text-white mb-6 uppercase tracking-tight">
                        Conditions <span className="text-[var(--color-primary)]">Générales</span>
                    </h1>
                    <p className="text-slate-400 text-sm mb-10 pb-6 border-b border-[var(--color-border)]">
                        Dernière mise à jour : {new Date().toLocaleDateString()}
                    </p>

                    <div className="space-y-8 text-slate-300 font-light leading-relaxed">
                        <section>
                            <h2 className="text-2xl font-bold text-white mb-4 uppercase tracking-wider">1. Présentation</h2>
                            <p>
                                Les présentes Conditions Générales (CG) régissent l'utilisation de la plateforme de réservation et de gestion de véhicules <strong>TRM Rent Car</strong>. En utilisant nos services, vous acceptez pleinement et sans réserve ces conditions.
                            </p>
                        </section>

                        <section>
                            <h2 className="text-2xl font-bold text-white mb-4 uppercase tracking-wider">2. Réservation et Paiement</h2>
                            <p className="mb-3">
                                Pour valider une réservation, le client doit être âgé de plus de 21 ans et présenter un permis de conduire valide datant de plus de 2 ans.
                            </p>
                            <ul className="list-disc pl-5 space-y-2">
                                <li>Un dépôt de garantie (caution) sera exigé lors de la remise du véhicule.</li>
                                <li>Le montant total de la location doit être réglé au plus tard la récupération du véhicule.</li>
                                <li>En cas d'annulation moins de 48h avant, des frais pourront s'appliquer.</li>
                            </ul>
                        </section>

                        <section>
                            <h2 className="text-2xl font-bold text-white mb-4 uppercase tracking-wider">3. Utilisation du Véhicule</h2>
                            <p className="mb-3">Le loueur s'engage à utiliser le véhicule avec prudence. Le véhicule ne peut être conduit que par les personnes expressément mentionnées au contrat.</p>
                            <ul className="list-disc pl-5 space-y-2">
                                <li>Il est strictement interdit de sous-louer le véhicule.</li>
                                <li>Le véhicule ne peut être utilisé à des fins de compétition ou de transport rémunéré.</li>
                                <li>Toute infraction au code de la route reste à la charge exclusive du locataire (amendes radars, stationnements).</li>
                            </ul>
                        </section>

                        <section>
                            <h2 className="text-2xl font-bold text-white mb-4 uppercase tracking-wider">4. Assurances</h2>
                            <p>
                                Les véhicules sont couverts par une assurance "Tous Risques". Toutefois, une franchise reste à la charge du client en cas de sinistre responsable ou de dommages sans tiers identifié. Le montant de la franchise est précisé sur le contrat de location.
                            </p>
                        </section>

                        <section>
                            <h2 className="text-2xl font-bold text-white mb-4 uppercase tracking-wider">5. GPS et Surveillance</h2>
                            <p>
                                Nos véhicules peuvent être équipés d'un système de géolocalisation pour la sécurité de la flotte et du conducteur. En signant le contrat, vous acceptez que la position du véhicule puisse être retracée.
                            </p>
                        </section>
                    </div>
                </div>
            </div>
        </div>
    );
}
