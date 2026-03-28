describe('TRM Rent Car - Flux Complet Utilisateur & Admin (E2E Local)', () => {
    const uniqueId = Date.now().toString().slice(-6);
    const testUser = {
        firstName: 'OtmanE2E',
        lastName: 'Test',
        email: `otman.e2e.${uniqueId}@trmrentcar.ma`,
        phone: '0612345678',
        password: 'Password123!',
    };

    const adminUser = {
        email: 'admin@trmrentcar.ma',
        password: 'AdminTRM2026!',
    };

    before(() => {
        cy.clearLocalStorage();
        cy.clearCookies();
        window.localStorage.clear();
        window.sessionStorage.clear();
    });

    it('Cycle de vie complet : Inscription -> Réservation -> Confirmation Admin', () => {
        // --- 1. INSCRIPTION ---
        cy.visit('/register');
        cy.get('input[id="first-name"]').type(testUser.firstName);
        cy.get('input[id="last-name"]').type(testUser.lastName);
        cy.get('input[id="register-email"]').type(testUser.email);
        cy.get('input[id="register-phone"]').type(testUser.phone);
        cy.get('input[id="register-password"]').type(testUser.password);
        cy.get('input[id="terms"]').check({ force: true });
        
        cy.contains('button', 'Créer mon compte').click({ force: true });
        
        // Attendre la redirection vers le profil
        cy.url({ timeout: 20000 }).should('include', '/profile');

        // --- 2. RÉSERVATION ---
        // Naviguer vers les véhicules via menu ou URL
        cy.visit('/vehicles');
        
        // Attendre que la grille se charge
        cy.get('h3', { timeout: 15000 }).should('exist');
        
        // Cliquer sur le bouton Réserver du premier véhicule
        cy.contains('a', 'Réserver').first().click({ force: true });

        // Choisir Dates
        cy.url({ timeout: 15000 }).should('include', '/booking/checkout');
        cy.contains('Dates & Options', { timeout: 15000 }).should('be.visible');

        const startDate = new Date();
        startDate.setDate(startDate.getDate() + 3);
        const endDate = new Date(startDate);
        endDate.setDate(endDate.getDate() + 4);

        const buildLocalIso = (d: Date) => {
            const y = d.getFullYear();
            const m = String(d.getMonth() + 1).padStart(2, '0');
            const day = String(d.getDate()).padStart(2, '0');
            return `${y}-${m}-${day}`;
        };

        const isoStart = buildLocalIso(startDate);
        const isoEnd = buildLocalIso(endDate);

        cy.get('input[type="date"]').first().type(isoStart);
        cy.get('input[type="date"]').last().type(isoEnd);

        cy.contains('button', 'Suivant').click({ force: true });

        // Vos Informations
        cy.contains('Vos Informations', { timeout: 15000 }).should('be.visible');
        // Wait for customer data autofill from local storage session
        cy.get('input[type="text"]').first().should('have.value', testUser.firstName);

        cy.contains('button', 'Finaliser la Réservation').click({ force: true });
        
        // Confirmation page
        cy.contains('Enregistrée', { timeout: 25000 }).should('be.visible');

        // --- 3. ADMINISTRATION ---
        cy.clearLocalStorage(); // Logout as user

        cy.visit('/login');
        cy.get('input[type="email"]').type(adminUser.email);
        cy.get('input[type="password"]').type(adminUser.password);
        cy.contains('button', 'Se connecter', { matchCase: false }).click({ force: true });
        
        cy.url({ timeout: 20000 }).should('include', '/admin');
        
        cy.visit('/admin/reservations');
        cy.contains(testUser.firstName, { timeout: 20000 }).should('be.visible');

        // Confirmer la réservation
        cy.get('table').contains(testUser.firstName).parents('tr').find('button').first().click({ force: true });
        
        // Change status to confirmed
        cy.contains('Modifier la reservation', { timeout: 10000 }).should('be.visible');
        cy.contains('label', 'Statut').next('select').select('confirmed', { force: true });
        cy.contains('button', 'Confirmer').click({ force: true });
        
        // Check update
        cy.contains('Réservation mise a jour', { timeout: 10000, matchCase: false }).should('be.visible');
    });
});
