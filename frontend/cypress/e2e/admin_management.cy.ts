describe('Administration TRM Rent Car - Gestion Flotte & Compta', () => {
    beforeEach(() => {
        // Mock Session Admin
        cy.intercept('GET', '**/auth/v1/session**', {
            statusCode: 200,
            body: { session: { user: { id: 'admin-id', email: 'admin@trmrentcar.ma' } } }
        }).as('sessionAdmin');

        cy.intercept('GET', '**/rest/v1/profiles?select=*&id=eq.admin-id**', {
            statusCode: 200,
            body: [{ id: 'admin-id', role: 'super_admin', full_name: 'Super Admin' }]
        }).as('adminProfile');
    });

    it('Gère le parc automobile (Ajout/Modification)', () => {
        cy.intercept('GET', '**/rest/v1/vehicles**', {
            statusCode: 200,
            body: [
                { id: 'v1', brand: 'Dacia', model: 'Logan', plate_number: '1234 A 72', status: 'available', price_per_day: 300 }
            ]
        }).as('getVehicles');

        cy.visit('/admin/vehicles');
        cy.wait(['@sessionAdmin', '@adminProfile', '@getVehicles']);

        cy.contains('Flotte globale').should('be.visible');
        cy.contains('Dacia Logan').should('be.visible');

        // Ajouter un véhicule
        cy.contains('Ajouter un véhicule').click();
        cy.get('input[placeholder="Marque"]').type('Peugeot');
        cy.get('input[placeholder="Modèle"]').type('208');
        cy.get('input[placeholder="Numéro d\'immatriculation"]').type('5678 B 72');

        cy.intercept('POST', '**/rest/v1/vehicles', { statusCode: 201 }).as('createVehicle');
        cy.contains('Enregistrer').click();
        cy.wait('@createVehicle');
        cy.contains('Véhicule ajouté').should('be.visible');
    });

    it('Vérifie la comptabilité et les transactions automatiques', () => {
        cy.intercept('GET', '**/rest/v1/accounting_transactions**', {
            statusCode: 200,
            body: [
                { id: 't1', type: 'income', amount: 1500, category: 'Location', description: 'Réservation #123', created_at: new Date().toISOString() }
            ]
        }).as('getTransactions');

        cy.visit('/admin/accounting');
        cy.wait(['@sessionAdmin', '@adminProfile', '@getTransactions']);

        cy.contains('Comptabilité').should('be.visible');
        cy.contains('1 500 MAD').should('be.visible');
        cy.contains('income').should('be.visible');
    });

    it('Consulte les factures et les contrats', () => {
        cy.intercept('GET', '**/rest/v1/reservations?select=**', {
            statusCode: 200,
            body: [
                {
                    id: 'res-1',
                    total_price: 1500,
                    status: 'confirmed',
                    customers: { full_name: 'Otman Test' },
                    invoices: [{ invoice_number: 'FAC-2026-001', total_amount: 1500, payment_status: 'paid' }]
                }
            ]
        }).as('getInvoices');

        cy.visit('/admin/invoices');
        cy.wait(['@sessionAdmin', '@adminProfile', '@getInvoices']);

        cy.contains('FAC-2026-001').should('be.visible');
        cy.contains('Payée').should('be.visible');
    });
});
