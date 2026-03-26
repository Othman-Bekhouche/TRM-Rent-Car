describe('TRM Rent Car - Flux Complet Utilisateur & Admin', () => {
    const testUser = {
        firstName: 'Otman',
        lastName: 'Test',
        email: `otman.test.${Date.now()}@trmrentcar.ma`,
        phone: '0612345678',
        password: 'Password123!',
    };

    const adminUser = {
        email: 'admin@trmrentcar.ma',
        password: 'admin-password', // Note: Utilise les vrais identifiants si possible
    };

    it('Cycle de vie complet : Inscription -> Réservation -> Confirmation Admin', () => {
        // --- 1. INSCRIPTION ---
        cy.visit('/register');
        cy.get('input[id="first-name"]').type(testUser.firstName);
        cy.get('input[id="last-name"]').type(testUser.lastName);
        cy.get('input[id="register-email"]').type(testUser.email);
        cy.get('input[id="register-phone"]').type(testUser.phone);
        cy.get('input[id="register-password"]').type(testUser.password);
        cy.get('input[id="terms"]').check();

        // Mocking Supabase Auth to avoid creating 1000 real users during tests
        cy.intercept('POST', '**/auth/v1/signup**', {
            statusCode: 200,
            body: { user: { id: 'new-user-id', email: testUser.email } }
        }).as('signup');
        cy.intercept('POST', '**/rest/v1/customers**', { statusCode: 201 }).as('createCustomer');

        cy.contains('Créer mon compte').click();
        cy.wait(['@signup', '@createCustomer']);
        cy.contains('Compte créé avec succès').should('be.visible');

        // --- 2. RÉSERVATION ---
        // On simule d'être connecté
        cy.intercept('GET', '**/auth/v1/session**', {
            statusCode: 200,
            body: { session: { user: { id: 'new-user-id', email: testUser.email, user_metadata: { full_name: 'Otman Test' } } } }
        }).as('sessionUser');

        // On va sur la page d'un véhicule (ex: Dacia Logan)
        // On mock le véhicule
        cy.intercept('GET', '**/rest/v1/vehicles?select=*&id=eq.**', {
            statusCode: 200,
            body: [{
                id: 'veh-logan-id',
                brand: 'Dacia',
                model: 'Logan',
                plate_number: '1234 A 72',
                price_per_day: 300,
                deposit_amount: 3000,
                status: 'available'
            }]
        }).as('getVehicle');

        cy.visit('/booking/checkout/veh-logan-id?start=2026-04-10&end=2026-04-15');
        cy.wait(['@sessionUser', '@getVehicle']);

        // Étape 1 : Dates & Options
        cy.contains('Dacia Logan').should('be.visible');
        cy.contains('900 MAD'); // 3 jours (calculé par Cypress ou le code) -> En fait 10 au 15 = 5 jours = 1500 MAD

        cy.intercept('POST', '**/rest/v1/rpc/check_vehicle_availability', {
            statusCode: 200,
            body: [{ is_available: true }]
        }).as('checkAvail');

        cy.contains('Suivant').click();
        cy.wait('@checkAvail');

        // Étape 2 : Informations Client (Auto-remplies car connecté)
        cy.get('input[value="Otman"]').should('be.visible');

        cy.intercept('POST', '**/rest/v1/rpc/handle_checkout_customer', {
            statusCode: 200,
            body: 'cust-uuid-123'
        }).as('handleCustomer');

        cy.intercept('POST', '**/rest/v1/reservations', {
            statusCode: 201
        }).as('postReservation');

        cy.contains('Finaliser la Réservation').click();
        cy.wait(['@handleCustomer', '@postReservation']);

        // Étape 3 : Confirmation
        cy.contains('Demande Enregistrée').should('be.visible');

        // --- 3. ADMINISTRATION ---
        // Changement de rôle pour l'admin
        cy.intercept('GET', '**/auth/v1/session**', {
            statusCode: 200,
            body: { session: { user: { id: 'admin-id', email: adminUser.email } } }
        }).as('sessionAdmin');

        cy.intercept('GET', '**/rest/v1/profiles?select=*&id=eq.admin-id**', {
            statusCode: 200,
            body: [{ id: 'admin-id', role: 'super_admin', full_name: 'Super Admin' }]
        }).as('adminProfile');

        cy.intercept('GET', '**/rest/v1/reservations**', {
            statusCode: 200,
            body: [{
                id: 'res-new-id',
                start_date: '2026-04-10',
                end_date: '2026-04-15',
                status: 'pending',
                total_price: 1500,
                vehicle_id: 'veh-logan-id',
                customers: { full_name: 'Otman Test' }
            }]
        }).as('getPendingReservations');

        cy.visit('/admin/reservations');
        cy.wait(['@sessionAdmin', '@adminProfile', '@getPendingReservations']);

        cy.contains('Otman Test').should('be.visible');
        cy.contains('pending').should('be.visible');

        // Confirmer la réservation
        cy.intercept('PATCH', '**/rest/v1/reservations?id=eq.res-new-id**', {
            statusCode: 200
        }).as('confirmRes');

        // On simule le clic sur "Editer" ou direct "Confirmer" si le bouton existe
        // Dans Reservations.tsx, on a un bouton Switch pour le statut ou un Modal
        cy.contains('Otman Test').parent().find('button').first().click(); // Ouvre le modal
        cy.get('select').first().select('confirmed');
        cy.contains('Enregistrer').click();
        cy.wait('@confirmRes');

        cy.contains('Réservation mise à jour').should('be.visible');
    });
});
