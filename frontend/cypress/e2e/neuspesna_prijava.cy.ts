describe('Login Page', () => {
  beforeEach(() => {
    cy.visit('/auth/login');
  });

  it('should display login form', () => {
    cy.contains('Prijava v Omrežnina+').should('be.visible');
    cy.get('input[type="email"]').should('exist');
    cy.get('input[type="password"]').should('exist');
    cy.get('button').contains('Prijava').should('be.visible');
  });

  it('should reject invalid credentials', () => {
    cy.get('input[type="email"]').type('test@example.com');
    cy.get('input[type="password"]').type('napačnoGeslo123');
    cy.get('button').contains('Prijava').click();

    cy.url().should('include', '/auth/login');

    cy.contains(/Napaka pri prijavi. Preverite podatke./i).should('be.visible');
  });
});
