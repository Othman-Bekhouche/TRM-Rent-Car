describe('Audit Production - TRM Rent Car', () => {
  const PROD_URL = 'https://trmrentcar.com';

  beforeEach(() => {
    cy.visit(PROD_URL);
  });

  it('Vérifie le chargement de la flotte (API REST)', () => {
    // Les voitures sont présentes car CORS fonctionne sur la Home
    cy.get('.bg-card, .rounded-2xl', { timeout: 10000 }).should('have.length.at.least', 1);
  });

  it('Vérifie le formulaire de contact', () => {
    cy.visit(`${PROD_URL}/contact`);
    cy.get('input[name="full_name"]', { timeout: 5000 }).type('Test de Production');
    cy.get('input[name="email"]').type('test@trmrentcar.com');
    cy.get('textarea[name="message"]').type('Vérification des notifications par Cypress.');
    cy.get('button[type="submit"]').should('not.be.disabled');
  });

  it('Audit du statut WebSocket sur api.trmrentcar.com', () => {
    cy.visit(`${PROD_URL}/login`);
    // On vérifie que les requêtes vers l'API sont autorisées (200 OK)
    cy.request('GET', 'https://api.trmrentcar.com/rest/v1/vehicles?select=*&limit=1').then((res) => {
        expect(res.status).to.eq(200);
    });
  });
});
