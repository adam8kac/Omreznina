describe('Login Page', () => {
  beforeEach(() => {
    cy.visit('/auth/login');
  });

  it('should display login form', () => {
    cy.contains('Prijava v Omrežnina+').should('be.visible');
    cy.get('input#email').should('exist');
    cy.get('input#password').should('exist');
    cy.get('button').contains('Prijava').should('be.visible');
  });

  it('should reject invalid credentials with error message', () => {
    cy.get('input#email').type('test@example.com');
    cy.get('input#password').type('napačnoGeslo123');
    cy.get('button').contains('Prijava').click();

    cy.url().should('include', '/auth/login');

    cy.contains('Napaka pri prijavi. Preverite podatke.').should('be.visible');
  });

  it('should show validation error for empty fields', () => {
    cy.get('button').contains('Prijava').click();

    cy.contains('Vnesite svoj email naslov.').should('be.visible');
  });

  it('should show modal for password reset', () => {
    cy.contains('Pozabljeno geslo?').click();
    cy.contains('Pozabljeno geslo').should('be.visible');
    cy.get('input#resetEmail').should('be.visible');
  });
});
