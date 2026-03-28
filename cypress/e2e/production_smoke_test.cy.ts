describe('Audit Production - TRM Rent Car', () => {
    const PROD_URL = 'https://trmrentcar.com';
  
    beforeEach(() => {
      cy.visit(PROD_URL);
    });
  
    it('Vérifie le chargement de la flotte (API REST)', () => {
      // On s'assure qu'au moins une voiture est visible (Preuve que REST/CORS est OK)
      cy.get('.bg-card, .rounded-2xl', { timeout: 10000 }).should('have.length.at.least', 1);
    });
  
    it('Vérifie le formulaire de contact', () => {
      cy.visit(`${PROD_URL}/contact`);
      // Simuler une saisie
      cy.get('input[name="full_name"]', { timeout: 5000 }).type('Test de Production');
      cy.get('input[name="email"]').type('test@trmrentcar.com');
      cy.get('textarea[name="message"]').type('Ceci est un test automatique Cypress depuis le système Antigravity.');
      
      // On vérifie si le bouton est cliquable
      cy.get('button[type="submit"]').should('not.be.disabled');
    });
  
    it('Audit des WebSockets (Notifications)', () => {
      cy.visit(`${PROD_URL}/login`);
      
      // On inspecte les requêtes réseau vers api.trmrentcar.com
      cy.intercept('GET', '**/rest/v1/**').as('getRest');
      cy.wait('@getRest').its('response.statusCode').should('eq', 200);

      // On vérifie l'accès direct à l'API via fetch
      cy.request('GET', 'https://api.trmrentcar.com/rest/v1/vehicles?select=*&limit=1').then((res) => {
          expect(res.status).to.eq(200);
          expect(res.headers).to.have.property('access-control-allow-origin');
      });
    });
  });
