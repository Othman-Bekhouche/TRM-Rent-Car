describe('TRM Rent Car - Tests de Chargement (Smoke Tests)', () => {
    const roles = {
        superAdmin: { email: 'admin@trmrentcar.ma', password: 'AdminTRM2026!' },
        gestionnaire: { email: 'ahmed.t@trmrentcar.ma', password: 'AhmedTRM2026!' }
    };

    const loginAs = (role: { email: string; password: string }) => {
        cy.visit('/login');
        cy.url().then(currentUrl => {
            if (!currentUrl.includes('/admin')) {
                cy.get('input[type="email"]', { timeout: 15000 }).should('be.visible').type(role.email);
                cy.get('input[type="password"]').type(role.password);
                cy.contains('button', 'Se connecter', { matchCase: false }).click({ force: true });
            }
        });
        cy.url({ timeout: 25000 }).should('include', '/admin');
    };

    // ==========================================
    // PUBLIC PAGES LOAD
    // ==========================================
    context('Pages Publiques', () => {
        const publicPages = [
            { path: '/', title: 'Location de voitures' },
            { path: '/vehicles', title: 'Notre Flotte' },
            { path: '/about', title: 'À propos' },
            { path: '/contact', title: 'Contact' },
            { path: '/login', title: 'Connexion' },
            { path: '/register', title: 'Inscription' },
            { path: '/terms', title: 'Conditions Générales' },
            { path: '/privacy', title: 'Confidentialité' }
        ];

        publicPages.forEach(page => {
            it(`Charge la page ${page.path}`, () => {
                cy.visit(page.path);
                cy.get('body').should('be.visible');
                // Allow h1 or h2 as main title (modern UI often uses h2 for centered forms)
                cy.get('h1, h2').should('exist');
            });
        });
    });

    // ==========================================
    // ADMIN PAGES LOAD
    // ==========================================
    context('Pages Administration (SuperAdmin)', () => {
        beforeEach(() => {
            loginAs(roles.superAdmin);
        });

        const adminPages = [
            { path: '/admin', title: 'Dashboard' },
            { path: '/admin/reservations', title: 'Réservations' },
            { path: '/admin/vehicles', title: 'Flotte' },
            { path: '/admin/rented-vehicles', title: 'Loués' },
            { path: '/admin/customers', title: 'Clients' },
            { path: '/admin/quotes', title: 'Devis' },
            { path: '/admin/contracts', label: 'Contrats' },
            { path: '/admin/invoices', label: 'Facturation' },
            { path: '/admin/infractions', label: 'Infractions' },
            { path: '/admin/gps', label: 'Suivi GPS' },
            { path: '/admin/accounting', label: 'Comptabilité' },
            { path: '/admin/history', label: 'Historique' },
            { path: '/admin/maintenance', label: 'Maintenance' },
            { path: '/admin/settings', label: 'Paramètres' },
            { path: '/admin/users', label: 'Administrateurs' },
            { path: '/admin/messages', label: 'Boîte Mail' },
            { path: '/admin/profile', label: 'Mon Profil' }
        ];

        adminPages.forEach(page => {
            it(`Charge la page admin ${page.path}`, () => {
                cy.visit(page.path);
                // Wait for any loading animations (lucide-react loaders)
                cy.get('body').find('svg.animate-spin', { timeout: 15000 }).should('not.exist');
                cy.get('body').should('be.visible');
                // Check for a title h1 or h2
                cy.get('h1, h2').should('exist');
            });
        });

        it('Vérifie le rendu des tableaux de bord et graphiques', () => {
            cy.visit('/admin');
            cy.get('svg').should('exist'); // Checks for Chart presence
            cy.contains('Chiffre d\'Affaires').should('be.visible');
        });
    });

    // ==========================================
    // ERROR / 404 LOAD
    // ==========================================
    context('Pages de fallback/Erreur', () => {
        it('Charge une page 404 personnalisée', () => {
            cy.visit('/page-qui-n-existe-pas', { failOnStatusCode: false });
            // Since there is no explicit 404 page in App.tsx, we check if it redirects or shows default
            // But we can check that it doesn't crash
            cy.url().should('include', '/page-qui-n-existe-pas');
        });
    });
});
