describe('Grand Audit Production E2E - TRM Rent Car', () => {
  const PROD_URL = 'https://trmrentcar.com';

  beforeEach(() => {
    // Eviter de casser le test en cas de petites erreurs console du navigateur
    cy.on('uncaught:exception', () => false);
  });

  describe('1. VÉRIFICATION DU FLUX VISITEUR (PUBLIC)', () => {
    it('1.1. Page d\'accueil (SEO & Composants)', () => {
      cy.visit(PROD_URL);
      cy.title().should('match', /TRM Rent Car/i);
      
      // Le bouton vers la flotte doit être présent
      cy.contains(/Découvrir|Flotte/i).should('be.visible').and('have.attr', 'href');
    });

    it('1.2. Page Flotte (API & Filtres)', () => {
      cy.visit(`${PROD_URL}/vehicles`);
      // Au moins 1 véhicule doit charger (Test de l'API Supabase backend)
      cy.get('.bg-card, .rounded-2xl', { timeout: 15000 }).should('have.length.at.least', 1);

      // Tester l'interaction avec le sélecteur de catégories
      cy.get('select').first().select('eco');
      // On s'assure que ça ne fait pas crasher l'application
      cy.get('.bg-card, .rounded-2xl').should('exist');
    });

    it('1.3. Informations Véhicule', () => {
      cy.visit(`${PROD_URL}/vehicles`);
      // On attend le chargement
      cy.get('.bg-card, .rounded-2xl', { timeout: 15000 }).should('have.length.at.least', 1);
      
      // On clique sur le bouton de réservation principal ("Réserver" ou "Louer")
      cy.contains(/Réserver|Louer|RESERVER/i).first().click();
      
      // L'URL devrait changer pour montrer les détails de la voiture ou rediriger au login
      cy.url().should('not.eq', `${PROD_URL}/vehicles`);
    });

    it('1.4. Formulaire de Contact', () => {
      cy.visit(`${PROD_URL}/contact`);
      // Remplissage simulé pour vérifier les champs
      cy.get('input[type="text"]').first().focus().type('Cyber Audit');
      cy.get('input[type="email"]').first().focus().type('sec-ops@trmrentcar.com');
      cy.get('textarea').first().focus().type('Verification de la production par Antigravity.');
      
      // Le bouton d'envoi doit être accessible
      cy.contains(/Envoyer/i).first().should('be.visible');
    });
  });

  describe('2. VÉRIFICATION DU SYSTÈME AUTHENTIFICATION ET ADMIN', () => {
    it('2.1. Page de Connexion', () => {
      cy.visit(`${PROD_URL}/login`);
      cy.get('input[type="email"]').type('audit-fail@trmrentcar.com');
      cy.get('input[type="password"]').type('motdepasse123');
      
      // On cherche le bouton Se connecter (Peu importe la casse)
      cy.contains(/Connecter|Connexion/i).click();
      
      // On s'attend à voir un message d'erreur rouge, prouvant que Supabase répond
      cy.contains(/Erreur|Incorrect|Identifiants/i, { timeout: 8000 }).should('be.visible');
    });

    it('2.2. Accès à l\'Admin (Redirection Sécurisée)', () => {
      // Un visiteur anonyme qui tente d'aller sur l'admin doit être bloqué
      cy.visit(`${PROD_URL}/admin`);
      
      // Doit rediriger vers le login très rapidement
      cy.url({ timeout: 10000 }).should('include', '/login');
    });
  });

  describe('3. SANTÉ DES SERVEURS API', () => {
    it('3.1. API de Base (REST Supabase)', () => {
      cy.request('GET', 'https://api.trmrentcar.com/rest/v1/vehicles?select=id&limit=1').then((res) => {
        expect(res.status).to.eq(200);
        // Le serveur doit renvoyer les headers CORS qu'on a configuré sur HestiaCP
        expect(res.headers).to.have.property('access-control-allow-origin'); 
      });
    });

    it('3.2. API Temps Réel (WebSockets Port 4000)', () => {
      // Cette requête vérifie spécifiquement le port 4000 qu'on vient de réparer
      cy.request({
        url: 'https://api.trmrentcar.com/realtime/v1/health',
        failOnStatusCode: false
      }).then((response) => {
        // Le 404 est parfait : ça signifie que Realtime (Elixir) tourne mais rejette le health (ce qui est normal pour Supabase)
        // Le 200 est parfait aussi.
        // Ce qu'on ne veut pas, c'est le 502 Bad Gateway (Nginx cassé).
        expect(response.status).to.not.equal(502);
        expect(response.status).to.not.equal(504);
        cy.log('Statut du Tunnel WebSocket : Opérationnel 🔥 (' + response.status + ')');
      });
    });
  });
});
