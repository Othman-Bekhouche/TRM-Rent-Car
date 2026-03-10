export default function Privacy() {
    return (
        <div className="bg-[var(--color-background)] py-20 min-h-screen">
            <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="bg-[#141C2B] border border-[var(--color-border)] rounded-3xl p-8 md:p-12 shadow-2xl">
                    <h1 className="text-4xl md:text-5xl font-black text-white mb-6 uppercase tracking-tight">
                        Politique de <span className="text-[var(--color-primary)]">Confidentialité</span>
                    </h1>
                    <p className="text-slate-400 text-sm mb-10 pb-6 border-b border-[var(--color-border)]">
                        Dernière mise à jour : {new Date().toLocaleDateString()}
                    </p>

                    <div className="space-y-8 text-slate-300 font-light leading-relaxed">
                        <section>
                            <h2 className="text-2xl font-bold text-white mb-4 uppercase tracking-wider">1. Collecte des Informations</h2>
                            <p className="mb-3">
                                Nous recueillons des informations lorsque vous vous inscrivez sur notre plateforme, effectuez une réservation, ou utilisez nos services de location de véhicules :
                            </p>
                            <ul className="list-disc pl-5 space-y-2">
                                <li><strong>Informations personnelles :</strong> Nom complet, Email, Téléphone, CIN, Copie du Permis.</li>
                                <li><strong>Données de transaction :</strong> Choix du véhicule, historique de location, montants payés.</li>
                                <li><strong>Géolocalisation :</strong> Nos véhicules peuvent être équipés de boîtiers télématiques.</li>
                            </ul>
                        </section>

                        <section>
                            <h2 className="text-2xl font-bold text-white mb-4 uppercase tracking-wider">2. Utilisation des Informations</h2>
                            <p className="mb-3">Les données que nous recueillons auprès de vous peuvent être utilisées pour :</p>
                            <ul className="list-disc pl-5 space-y-2">
                                <li>Contractualiser et valider votre réservation.</li>
                                <li>Améliorer et personnaliser votre expérience client.</li>
                                <li>Fournir un support et une facturation fiables.</li>
                                <li>Effectuer le suivi GPS exclusif pour la sécurité du parc.</li>
                                <li>Identifier l'auteur des amendes et des infractions selon les lois en vigueur.</li>
                            </ul>
                        </section>

                        <section>
                            <h2 className="text-2xl font-bold text-white mb-4 uppercase tracking-wider">3. Protection des Données (Supabase & RLS)</h2>
                            <p>
                                Notre plateforme utilise une base de données de haute sécurité (Supabase) couplée à un cryptage SSL de bout en bout.
                                La sécurité de vos données (Row Level Security) garantit que seuls nos employés autorisés peuvent accéder à vos données personnelles dans le strict cadre de nos opérations commerciales.
                            </p>
                        </section>

                        <section>
                            <h2 className="text-2xl font-bold text-white mb-4 uppercase tracking-wider">4. Divulgation à des Tiers</h2>
                            <p>
                                Nous ne vendons, n'échangeons, ne transférons en aucun cas vos informations personnelles identifiables à des sociétés externes. Cela ne comprend pas les partenaires techniques de confiance nécessaires au fonctionnement du service (serveurs d'hébergement, prestataires de paiement), pourvu de conventions de confidentialité.
                                Les autorités peuvent exiger ces données dans le cadre d'enquêtes sur des infractions légales.
                            </p>
                        </section>

                        <section>
                            <h2 className="text-2xl font-bold text-white mb-4 uppercase tracking-wider">5. Vos Droits</h2>
                            <p>
                                Vous disposez d'un droit d'accès, de rectification et d'effacement de vos données personnelles. Pour exercer ce droit, il suffit de nous contacter via l'adresse "trm.rentcar@gmail.com".
                            </p>
                        </section>

                        <section>
                            <h2 className="text-2xl font-bold text-white mb-4 uppercase tracking-wider">6. Consentement</h2>
                            <p>
                                En utilisant notre site (TRM Rent Car), vous consentez à notre politique de confidentialité.
                            </p>
                        </section>
                    </div>
                </div>
            </div>
        </div>
    );
}
