describe('Administration TRM Rent Car - Gestion Flotte & Compta', () => {
    const adminUser = { email: 'admin@trmrentcar.ma', password: 'AdminTRM2026!' };

    beforeEach(() => {
        cy.clearLocalStorage();
        cy.clearCookies();
        window.localStorage.clear();
        window.sessionStorage.clear();
        
        cy.visit('/login');
        cy.get('input[type="email"]').type(adminUser.email);
        cy.get('input[type="password"]').type(adminUser.password);
        cy.contains('button', 'Se connecter', { matchCase: false }).click();
        cy.url({ timeout: 20000 }).should('include', '/admin');
    });

    it('Gère le parc automobile (Vue et Ajout simulé)', () => {
        cy.visit('/admin/vehicles');
        cy.contains('Flotte globale', { timeout: 15000 }).should('be.visible');
        
        // Attendre que la grille affiche un véhicule : par ex. Dacia ou Renault
        cy.get('table tbody tr', { timeout: 15000 }).should('have.length.greaterThan', 0);

        // Open modal
        cy.contains('button', 'Nouveau Véhicule').click();
        cy.contains('Informations Principales', { timeout: 10000 }).should('be.visible');
        cy.contains('button', 'Annuler').click();
    });

    it('Consulte la vue Comptabilité', () => {
        cy.visit('/admin/accounting');
        cy.contains('Comptabilité', { timeout: 15000 }).should('be.visible');
        cy.contains('Revenus', { timeout: 15000 }).should('be.visible');
        cy.contains('Dépenses', { timeout: 10000 }).should('be.visible');
    });

    it('Consulte la vue Factures', () => {
        cy.visit('/admin/invoices');
        cy.contains('Factures', { timeout: 15000 }).should('be.visible');
        cy.contains('Rechercher', { timeout: 10000 }).should('be.visible');
    });
});
