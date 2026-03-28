const PROD_URL = 'https://trmrentcar.com';

describe('Production Mobile Responsiveness Audit', () => {
  beforeEach(() => {
    // Simulate iPhone X viewport (375x812)
    cy.viewport('iphone-x');
  });

  const checkHorizontalOverflow = () => {
    // The scrollWidth should not exceed viewportWidth on mobile
    cy.window().then((win) => {
      const scrollWidth = win.document.documentElement.scrollWidth;
      const viewportWidth = win.innerWidth;
      expect(scrollWidth).to.be.at.most(viewportWidth, 'Page should not have horizontal scrollbar on mobile');
    });
  };

  it('Verifies Navbar and Mobile Menu on Homepage', () => {
    cy.visit(PROD_URL);
    cy.wait(4000);
    
    // Check if desktop menu is hidden
    cy.contains('Accueil').should('not.be.visible');

    // Open mobile menu
    cy.get('button').find('svg.lucide-menu').should('exist').click({ force: true });
    cy.wait(500);

    // Verify mobile menu elements are visible
    cy.get('.md\\:hidden').contains('Accueil').should('be.visible');
    cy.get('.md\\:hidden').contains('Flotte').should('be.visible');

    // Close mobile menu
    cy.get('button').find('svg.lucide-x').should('exist').click({ force: true });

    checkHorizontalOverflow();
  });

  it('Verifies Homepage layout and overflow', () => {
    cy.visit(PROD_URL);
    cy.wait(2000);
    checkHorizontalOverflow();
  });

  it('Verifies Fleet (Vehicles) page layout on mobile', () => {
    cy.visit(`${PROD_URL}/vehicles`);
    cy.wait(2000);
    checkHorizontalOverflow();
  });

  it('Verifies About page layout on mobile', () => {
    cy.visit(`${PROD_URL}/about`);
    cy.wait(2000);
    checkHorizontalOverflow();
  });

  it('Verifies Contact page layout on mobile', () => {
    cy.visit(`${PROD_URL}/contact`);
    cy.wait(2000);
    checkHorizontalOverflow();
  });
});
