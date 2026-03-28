
describe('TRM Rent Car - Cycle de Vie Stabilisé (Réservation, Compta, Maintenance)', () => {
    const uniqueStr = Math.random().toString(36).substring(7);
    const name = `Cycle_${uniqueStr}`;
    
    const roles = {
        superAdmin: { email: 'admin@trmrentcar.ma', password: 'AdminTRM2026!' },
        gestionnaire: { email: 'ahmed.t@trmrentcar.ma', password: 'AhmedTRM2026!' },
        assistant: { email: 'sara.b@trmrentcar.ma', password: 'SaraTRM2026!' },
        client: { email: `client.${uniqueStr}@test.ma`, password: 'password123' }
    };

    const loginAs = (role: { email: any; password: any; }) => {
        cy.visit('/login');
        cy.get('input[type="email"]').type(role.email, { force: true });
        cy.get('input[type="password"]').type(role.password, { force: true });
        cy.get('button[type="submit"]').click({ force: true });
        // Attendre que l'URL change ou qu'un élément d'admin soit présent
        cy.url({ timeout: 15000 }).should('not.include', '/login');
        cy.get('body').should('not.contain', 'Invalid login credentials');
    };

    it('Pré-requis: Un véhicule disponible existe', () => {
        loginAs(roles.superAdmin);
        cy.visit('/admin/vehicles');
        cy.get('table').then($table => {
            if ($table.text().includes('Disponible')) {
               cy.log('Véhicule dispo trouvé');
            } else {
               // Ajouter un véhicule si besoin
               cy.contains('Ajouter un véhicule').click();
               cy.get('input[name="brand"]').type('Dacia');
               cy.get('input[name="model"]').type('Logan');
               cy.get('input[name="plate_number"]').type(`TEST-${uniqueStr}`);
               cy.get('input[name="price_per_day"]').type('350');
               cy.get('button[type="submit"]').click();
               cy.contains('Véhicule ajouté').should('exist');
            }
        });
    });

    it('Client: Parcours complet de réservation (Public -> Checkout)', () => {
        cy.visit('/vehicles');
        cy.get('a').contains('Réserver', { matchCase: false }).first().click({ force: true });

        // On est sur la page véhicule
        const today = new Date();
        const tomorrow = new Date();
        tomorrow.setDate(today.getDate() + 3);
        const isoStart = today.toISOString().split('T')[0];
        const isoEnd = tomorrow.toISOString().split('T')[0];

        cy.get('input[type="date"]').first().clear({ force: true }).type(isoStart, { force: true });
        cy.get('input[type="date"]').last().clear({ force: true }).type(isoEnd, { force: true });
        cy.contains('Poursuivre', { matchCase: false }).click({ force: true });

        // On arrive au Checkout
        cy.url().should('include', '/booking/checkout');
        
        // Étape 1: Récapitulatif
        cy.contains('Récapitulatif', { timeout: 15000 }).should('exist').scrollIntoView();
        cy.contains('button', 'Suivant', { matchCase: false }).click({ force: true });

        // Étape 2: Infos Client
        cy.get('#client-first-name').type('Client');
        cy.get('#client-last-name').type(name);
        cy.get('#client-email').type(`client.${uniqueStr}@test.ma`);
        cy.get('#client-phone').type('06' + Math.floor(Math.random() * 100000000).toString().padStart(8, '0'));
        
        // Cliquer Finaliser
        cy.contains('button', 'Finaliser la Réservation', { matchCase: false }).click({ force: true });

        // Confirmation succès
        cy.contains('envoyée avec succès', { matchCase: false, timeout: 15000 }).should('be.visible');
    });

    it('Gestionnaire: Valide la réservation et crée le dossier', () => {
        loginAs(roles.gestionnaire);
        cy.visit('/admin/reservations');
        
        // Rechercher par le nom unique pour éviter les collisions
        cy.get('input[placeholder*="Rechercher"]').type(name);
        cy.wait(1000);
        
        // Sélectionner la ligne
        cy.contains('tr', name).find('a[href*="/admin/reservations/"]').first().click({ force: true });
        
        // Sur la page détail, on valide
        cy.url().should('include', '/admin/reservations/');
        cy.contains('En attente').should('exist');
        
        // Accepter la réservation
        cy.contains('Confirmer').click();
        cy.contains('Statut mis à jour').should('exist');
    });

    it('Super Admin: Crée un devis et vérifie la compta', () => {
        loginAs(roles.superAdmin);
        
        // Module Devis
        cy.visit('/admin/quotes');
        cy.contains('NOUVEAU DEVIS').click();
        cy.get('select').first().select(1); // Premier client dispo
        cy.get('select').eq(1).select(1); // Premier véhicule dispo
        cy.get('input[type="number"]').first().clear().type('500'); // Prix
        
        cy.contains('button', 'ENREGISTRER LE DEVIS').click();
        cy.contains('Devis créé', { timeout: 15000 }).should('exist');

        // Vérification Module Compta
        cy.visit('/admin/accounting');
        cy.contains('Comptabilité').should('exist');
        cy.get('div').contains('Chiffre d\'Affaires').parent().find('p').first().then($p => {
            const valBefore = parseFloat($p.text().replace(/[^0-9]/g, ''));
            
            cy.contains('Nouveau Flux').click();
            cy.get('input[name="amount"]').type('1000', { force: true });
            cy.get('textarea[name="description"]').type('Encaissement Test E2E', { force: true });
            cy.get('button[name="submit-transaction"]').click({ force: true });
            
            // Attendre la notification de succès
            cy.get('body').contains('enregistrée', { timeout: 15000 }).should('be.visible');
            
            // Vérifier que le total a augmenté (ou contient la valeur attendue)
            cy.wait(2000);
            cy.reload(); // Refresh to catch total update if needed
            cy.get('div').contains('Chiffre d\'Affaires').parent().find('p').first().should(($p2) => {
                const valAfter = parseFloat($p2.text().replace(/[^0-9]/g, ''));
                expect(valAfter).to.be.greaterThan(valBefore);
            });
        });
    });

    it('Sécurité: L\'Assistant ne peut pas accéder aux Paramètres', () => {
        loginAs(roles.assistant);
        // Tenter d'accéder aux paramètres (URL directe)
        cy.visit('/admin/settings');
        // Redirection attendue
        cy.url().should('not.include', '/settings');
    });

    it('Public: Intégrité des pages et SEO', () => {
        cy.visit('/');
        cy.title().should('include', 'TRM Rent Car');
        cy.get('h1').should('exist');
        
        // Footer links
        cy.scrollTo('bottom');
        cy.contains("Conditions d'utilisation").should('exist');
        cy.contains('Contact').should('exist');
    });
});
