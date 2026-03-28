describe('Gestion des Réservations TRM Rent Car', () => {
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

    it('Affiche et filtre la liste des réservations', () => {
        cy.visit('/admin/reservations');
        cy.contains('Toutes', { timeout: 15000 }).should('be.visible');
        cy.contains('Reservations', { matchCase: false, timeout: 15000 }).should('be.visible');

        cy.get('input[placeholder="Rechercher..."]').type('Siham'); // Test search
        cy.wait(500); 
        cy.get('input[placeholder="Rechercher..."]').clear();
        
        // Clics sur les filtres pour vérifier que la pagination ou le tri ne casse rien
        cy.contains('button', 'En attente', { matchCase: false }).click();
        cy.contains('button', 'Confirme', { matchCase: false }).click();
        cy.contains('button', 'Toutes', { matchCase: false }).click();
    });
});
