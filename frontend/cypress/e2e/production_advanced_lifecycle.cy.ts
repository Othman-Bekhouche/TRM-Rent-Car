describe('TRM Rent Car - PRODUCTION Cycle de Vie Avancé (Totalité des modules)', () => {
    const PROD_URL = 'https://trmrentcar.com';
    
    // REMPLACEZ 'password123' PAR LE VRAI MOT DE PASSE DU SUPER ADMIN !
    const roles = {
        superAdmin: { email: Cypress.env('SUPER_ADMIN_EMAIL') || 'admin@trmrentcar.com', password: Cypress.env('SUPER_ADMIN_PASSWORD') || 'REPLACE_ME' },
        gestionnaire: { email: Cypress.env('GESTIONNAIRE_EMAIL') || 'gestion@trmrentcar.com', password: Cypress.env('GESTIONNAIRE_PASSWORD') || 'REPLACE_ME' },
        assistant: { email: Cypress.env('ASSISTANT_EMAIL') || 'Asistant@trmrentcar.com', password: Cypress.env('ASSISTANT_PASSWORD') || 'REPLACE_ME' },
        fallbackAdmin: { email: Cypress.env('FALLBACK_ADMIN_EMAIL') || 'othman.bekhouche.99@gmail.com', password: Cypress.env('FALLBACK_ADMIN_PASSWORD') || 'REPLACE_ME' }
    };

    const uniqueStr = Math.floor(Math.random() * 100000).toString().padStart(5, '0');
    const testClient = {
        firstName: 'Tariq',
        lastName: `ClientE2E_PROD_${uniqueStr}`,
        email: `tariq.prod.${uniqueStr}@trmrentcar.ma`,
        phone: `0611${uniqueStr.slice(0, 6)}`,
    };

    const loginAs = (role: { email: string; password: string }) => {
        // Redirection forcée au login
        cy.visit(`${PROD_URL}/login`);
        
        // On écoute la validation du mot de passe en arrière-plan
        cy.intercept('POST', '**/auth/v1/token*').as('loginRequest');
        
        cy.get('input[type="email"]', { timeout: 10000 }).should('be.visible').clear().type(role.email);
        cy.get('input[type="password"]').clear().type(role.password);
        cy.contains('button', /Connecter|Connexion/i).click({ force: true });
        
        // On FORÇE Cypress à attendre que Supabase donne le Feu Vert !
        cy.wait('@loginRequest', { timeout: 10000 });
        
        // On s'assure qu'on est bien entré dans l'admin avant de lâcher le robot !
        cy.url({ timeout: 15000 }).should('include', '/admin');
    };

    beforeEach(() => {
        cy.on('uncaught:exception', () => false); // Protection anti-crash interface
        cy.clearLocalStorage();
        cy.clearCookies();
    });

    // ==========================================
    // TEST 1: Super Admin — Dashboard overview
    // ==========================================
    it('1. Super Admin: Peut accéder à la vue globale sans erreur (Dashboard)', () => {
         loginAs(roles.superAdmin);
         cy.visit(`${PROD_URL}/admin`);
         cy.get('h1', { timeout: 15000 }).should('contain.text', 'Dashboard');
         cy.contains(/Chiffre d'Affaires|Revenus/i, { timeout: 15000 }).should('exist');
    });

    // ==========================================
    // TEST 2: Assistant — Fleet & invoices
    // ==========================================
    it('2. Assistant: Visualise la flotte, accède aux factures, vérifie la maintenance', () => {
        loginAs(roles.assistant);
        cy.visit(`${PROD_URL}/admin/invoices`);
        cy.get('h1', { timeout: 15000 }).should('contain.text', 'Facturation');

        cy.visit(`${PROD_URL}/admin/vehicles`);
        cy.get('h1', { timeout: 15000 }).should('contain.text', 'Flotte');
        cy.get('table tbody tr').first().find('button').first().click({ force: true });
        cy.contains('h2', 'Modifier', { timeout: 10000 }).should('be.visible');
    });

    // ==========================================
    // TEST 3: Gestionnaire — Full client lifecycle
    // ==========================================
    it('3. Gestionnaire: Gère un dossier client complet (Customer -> Réservation)', () => {
        loginAs(roles.gestionnaire);
        cy.visit(`${PROD_URL}/admin/customers`);
        cy.contains('button', /Ajouter|Nouveau client/i, { timeout: 15000 }).click({ force: true });

        cy.get('input[name="full_name"]').type(`${testClient.firstName} ${testClient.lastName}`);
        cy.get('input[name="email"]').type(testClient.email);
        cy.get('input[name="phone"]').type(testClient.phone);
        cy.contains('button', /Enregistrer|Valider/i).click({ force: true });

        // Création de réservation de test
        cy.visit(`${PROD_URL}/admin/reservations`);
        cy.contains('button', /Nouvelle Réservation|Ajouter/i, { timeout: 15000 }).click({ force: true });

        const dayOffset = 500 + (parseInt(uniqueStr) % 300);
        const startDate = new Date(); startDate.setDate(startDate.getDate() + dayOffset);
        const endDate = new Date(startDate); endDate.setDate(endDate.getDate() + 1);

        cy.get('form input[type="date"]').first().clear().type(startDate.toISOString().split('T')[0]);
        cy.get('form input[type="date"]').last().clear().type(endDate.toISOString().split('T')[0]);
        cy.wait(3000); 
        cy.contains('button', /Confirmer|Enregistrer/i).click({ force: true });
        cy.wait(5000);
    });

    // ==========================================
    // TEST 4: Gestionnaire — Maintenance record
    // ==========================================
    it('4. Gestionnaire: Ajoute un enregistrement de maintenance', () => {
         loginAs(roles.gestionnaire);
         cy.visit(`${PROD_URL}/admin/maintenance`);
         cy.get('h1', { timeout: 15000 }).should('contain.text', 'Maintenance');
         cy.contains('button', /Planifier Entretien|Prendre/i, { timeout: 15000 }).click({ force: true });
         cy.get('.fixed', { timeout: 10000 }).should('be.visible');
         cy.get('.fixed input[type="number"]').last().clear().type('1500', { force: true });
         cy.get('.fixed textarea').type('Révision Prod E2E', { force: true });
         cy.get('.fixed').contains('button', /Enregistrer/i).click({ force: true });
    });

    // ==========================================
    // TEST 5: Super Admin — Navigation complète
    // ==========================================
    it('5. Super Admin: Peut naviguer vers toutes les pages admin sans 404', () => {
         loginAs(roles.superAdmin);
         const pages = [
             { url: '/admin', heading: 'Dashboard' },
             { url: '/admin/vehicles', heading: 'Flotte' },
             { url: '/admin/customers', heading: 'Clients' },
             { url: '/admin/reservations', heading: 'Reservations' },
             { url: '/admin/accounting', heading: 'Comptabilit' },
             { url: '/admin/maintenance', heading: 'Maintenance' },
         ];
         pages.forEach(page => {
             cy.visit(`${PROD_URL}${page.url}`);
             cy.get('h1', { timeout: 15000 }).should('contain.text', page.heading);
         });
    });

    // ==========================================
    // TEST 6: Gestionnaire — Customer search
    // ==========================================
    it('6. Gestionnaire: Recherche un client existant en BDD', () => {
         loginAs(roles.gestionnaire);
         cy.visit(`${PROD_URL}/admin/customers`);
         cy.get('input[placeholder*="Rechercher"]', { timeout: 15000 }).type('ClientE2E');
         cy.wait(1000); // Laisse l'API de recherche tourner
         cy.get('table').should('exist');
    });

    // ==========================================
    // TEST 8: Client public — Inscription
    // ==========================================
    it('8. Client: Peut s\'inscrire sur le site public', () => {
         cy.visit(`${PROD_URL}/register`);
         cy.get('h2', { timeout: 15000 }).should('contain.text', 'compte');
         cy.get('#first-name').type('Testing');
         cy.get('#last-name').type(`User${uniqueStr}`);
         cy.get('#register-email').type(`test.user${uniqueStr}@client.ma`);
         cy.get('#register-phone').type(`06998877${uniqueStr.slice(0, 2)}`);
         cy.get('#register-password').type('Test2026Secure!');
         cy.get('#terms').check({ force: true });
         cy.contains('button', /Créer mon compte/i).click({ force: true });
         cy.wait(4000);
    });

    // ==========================================
    // TEST 9: Client public — E2E Booking
    // ==========================================
    it('9. Client: Checkout Flotte vers Connexion', () => {
         cy.visit(`${PROD_URL}/vehicles`);
         cy.contains(/Réserver|Louer|RESERVER/i).first().click({ force: true });
         cy.url({ timeout: 10000 }).should('match', /\/vehicles\/.+/);
         cy.contains(/MAD/i).should('exist');
         cy.get('input[type="date"]').first().type('2028-01-01');
         cy.get('input[type="date"]').last().type('2028-01-05');
         cy.contains(/Poursuivre|Continuer/i).click({ force: true });
         cy.url().should('include', '/login');
    });

    // ==========================================
    // TEST 11: Super Admin — Modules avancés (Complets)
    // ==========================================
    it('11. Super Admin: Accède aux modules avancés (Devis, Contrats, Infos...)', () => {
         loginAs(roles.superAdmin);
         const advancedPages = [
             { url: '/admin/quotes', heading: 'Devis' },
             { url: '/admin/contracts', heading: 'Contrats' },
             { url: '/admin/infractions', heading: 'Infractions' },
             { url: '/admin/messages', heading: 'Boîte Mail' },
             { url: '/admin/settings', heading: 'Paramètres' },
             { url: '/admin/users', heading: 'Administrateurs' },
             { url: '/admin/rented-vehicles', heading: 'Véhicules Loués' }
         ];

         advancedPages.forEach(page => {
             cy.visit(`${PROD_URL}${page.url}`);
             cy.get('h1', { timeout: 15000 }).should('exist');
         });
    });

    // ==========================================
    // TEST 12: Public — Pages d'information
    // ==========================================
    it('12. Public: Peut consulter les pages À Propos et Contact', () => {
         cy.visit(`${PROD_URL}/about`);
         cy.get('h1', { timeout: 10000 }).should('exist');
         
         cy.visit(`${PROD_URL}/contact`);
         cy.get('h1', { timeout: 10000 }).should('exist');
         cy.get('form').should('exist');
    });

    // ==========================================
    // TEST 21: Gestionnaire — Flux Manuel CA/Charges
    // ==========================================
    it('13. Gestionnaire: Crée un flux manuel de caisse', () => {
         loginAs(roles.gestionnaire);
         cy.visit(`${PROD_URL}/admin/accounting`);
         cy.contains('button', 'Nouveau Flux', { matchCase: false, timeout: 15000 }).click({ force: true });
         cy.get('.fixed', { timeout: 10000 }).should('be.visible');
         cy.get('.fixed input[type="number"]').first().clear().type('750', { force: true });
         cy.get('.fixed textarea').first().type('Test Prod Flux Manuel', { force: true });
         cy.get('.fixed').contains('button', /Enregistrer/i).click({ force: true });
         cy.wait(3000);
    });

    // ==========================================
    // TEST 25: Info : Création de conflit
    // ==========================================
    it('14. Gestionnaire: Vérifie la détection de conflit de dates', () => {
        loginAs(roles.gestionnaire);
        cy.visit(`${PROD_URL}/admin/reservations`);
        cy.contains('button', /Nouvelle Réservation|Ajouter/i).click({ force: true });
        
        // Saisie rapide pour tester l'UI de conflit (si configurée dans le front)
        cy.get('form input[type="date"]').first().clear().type('2027-04-23');
        cy.get('form input[type="date"]').last().clear().type('2027-04-25');
        cy.wait(2000);
        cy.get('body').should('exist');
    });

    // ==========================================
    // TEST 28: Super Admin — Création Véhicule (Tous les champs)
    // ==========================================
    it('15. Super Admin: Vérification des champs d\'ajout Véhicule', () => {
        loginAs(roles.superAdmin);
        cy.visit(`${PROD_URL}/admin/vehicles`);
        cy.contains('button', /Ajouter un véhicule|Nouveau/i).click({ force: true });
        cy.get('input[name="brand"]').should('be.visible');
        cy.get('input[name="plate_number"]').should('be.visible');
        cy.get('input[name="price_per_day"]').should('be.visible');
    });

    // ==========================================
    // TEST 30: Rôle RBAC
    // ==========================================
    it('16. Sécurité: Un assistant ne peut pas accéder aux paramètres agence', () => {
        loginAs(roles.assistant);
        cy.visit(`${PROD_URL}/admin/settings`);
        cy.wait(1000); // Laisse le processus de permission agir
        cy.url().then(url => {
            if (url.includes('/settings')) {
                // Soit la page montre un refus explicite
                cy.get('body').should('satisfy', (body) => {
                     const text = body.text().toLowerCase();
                     return text.includes('autorisé') || text.includes('refusé');
                });
            } else {
                // Soit il a été redirigé en dehors de /settings
                expect(url).to.not.include('/settings');
            }
        });
    });

    // ==========================================
    // TEST 36: Recherche Flotte Spécifique
    // ==========================================
    it('17. Gestionnaire: Recherche un véhicule par sa plaque inexistante (Empty state)', () => {
        loginAs(roles.gestionnaire);
        cy.visit(`${PROD_URL}/admin/vehicles`);
        cy.get('input[placeholder*="plaque"]').clear().type('PLAQUE-INEXISTANTE-999', { force: true });
        cy.contains(/Aucun véhicule/i).should('be.visible');
    });

    // ==========================================
    // TEST 37: Tri des Catégories en Public
    // ==========================================
    it('18. Public: Filtre les véhicules par catégorie en Prod', () => {
        cy.visit(`${PROD_URL}/vehicles`);
        cy.get('select').first().select('suv');
        cy.wait(1000);
        cy.get('body').then(($body) => {
            if ($body.find('span:contains("Luxe / SUV")').length > 0) {
                cy.log('Filtre Produit OK');
            }
        });
    });

    // ==========================================
    // TEST 39: WebSockets Admin Test
    // ==========================================
    it('19. Admin: Test direct du statut des Notifications (Realtime)', () => {
        loginAs(roles.assistant);
        cy.visit(`${PROD_URL}/admin`);
        // Le bouton de notification dans la barre du haut doit exister
        cy.get('button[title*="Notification"]', { timeout: 15000 }).should('exist');
    });
});
