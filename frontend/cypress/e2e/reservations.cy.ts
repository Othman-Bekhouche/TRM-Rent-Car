describe('Gestion des Réservations TRM Rent Car', () => {
    beforeEach(() => {
        // Mock session and profile for Admin
        cy.intercept('GET', '**/auth/v1/session**', {
            statusCode: 200,
            body: {
                session: {
                    user: { id: 'test-admin-id', email: 'admin@trmrentcar.ma' },
                    access_token: 'dummy-token'
                }
            }
        }).as('getSession');

        cy.intercept('GET', '**/rest/v1/profiles**', {
            statusCode: 200,
            body: [{ id: 'test-admin-id', full_name: 'Test Admin', role: 'super_admin' }]
        }).as('getProfile');

        // Initial records
        cy.intercept('GET', '**/rest/v1/reservations**', {
            statusCode: 200,
            body: [
                {
                    id: 'res-1',
                    start_date: '2026-03-25',
                    end_date: '2026-03-27',
                    status: 'confirmed',
                    vehicle_id: 'veh-1',
                    customers: { full_name: 'Siham Benani' }
                }
            ]
        }).as('getReservations');

        cy.intercept('GET', '**/rest/v1/vehicles**', {
            statusCode: 200,
            body: [
                { id: 'veh-1', brand: 'Dacia', model: 'Logan', plate_number: '1234 A 72', status: 'available' },
                { id: 'veh-2', brand: 'Peugeot', model: '208', plate_number: '5678 B 72', status: 'available' }
            ]
        }).as('getVehicles');

        cy.intercept('GET', '**/rest/v1/customers**', {
            statusCode: 200,
            body: [
                { id: 'cust-1', full_name: 'Siham Benani' }
            ]
        }).as('getCustomers');

        cy.visit('/admin/reservations');
        cy.wait(['@getSession', '@getProfile', '@getReservations']);
    });

    it('Affiche la liste des réservations et le calendrier', () => {
        cy.contains('Gerez toutes les locations').should('be.visible');
        cy.contains('Siham Benani').should('be.visible');
        // Vérifier présence calendrier
        cy.get('button').contains('Mars 2026').should('be.visible');
    });

    it('Filtre les réservations quand on change de véhicule', () => {
        // Mock l'appel de filtrage
        cy.intercept('GET', '**/rest/v1/reservations?select=id%2Cstart_date%2Cend_date%2Ccustomers%28full_name%29%2Cstatus&vehicle_id=eq.veh-2**', {
            statusCode: 200,
            body: []
        }).as('filterVeh2');

        cy.contains('Ajouter une réservation').click();
        cy.get('select').eq(1).select('veh-2'); // Peugeot 208

        cy.wait('@filterVeh2');
        cy.contains('DEBUG: 0 RECORDS').should('be.visible'); // Si le debug est toujours là
    });

    it('Vérifie la disponibilité proactivement', () => {
        cy.intercept('POST', '**/rest/v1/rpc/check_vehicle_availability', {
            statusCode: 200,
            body: [{ is_available: false, next_available_date: '2026-04-01' }]
        }).as('checkAvail');

        cy.contains('Ajouter une réservation').click();
        cy.get('select').eq(1).select('veh-1');
        cy.get('input[type="date"]').first().type('2026-03-25');
        cy.get('input[type="date"]').last().type('2026-03-31');

        cy.wait('@checkAvail');
        cy.contains('Ce vehicule est deja reserve').should('be.visible');
    });
});
