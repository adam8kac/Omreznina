// cypress/e2e/auth.cy.ts

describe('Avtentikacija – Prijava in Registracija', () => {
  beforeEach(() => {
    cy.visit('/auth/login');
  });

  it('Prikaz obrazca za prijavo', () => {
    cy.contains('Prijava v Omrežnina+').should('be.visible');
    cy.get('input#email').should('exist');
    cy.get('input#password').should('exist');
    cy.get('button').contains('Prijava').should('be.visible');
  });

  it('Napaka pri napačnih podatkih', () => {
    cy.get('input#email').type('test@example.com');
    cy.get('input#password').type('napačnoGeslo123');
    cy.get('button').contains('Prijava').click();
    cy.contains('Napaka pri prijavi').should('be.visible');
  });

  it('Napaka ob praznih poljih', () => {
    cy.get('button').contains('Prijava').click();
    cy.contains('Vnesite svoj email naslov.').should('be.visible');
  });

  it('Prikaz modalnega okna za pozabljeno geslo', () => {
    cy.contains('Pozabljeno geslo?').click();
    cy.contains('Pozabljeno geslo').should('be.visible');
    cy.get('input#resetEmail').should('exist');
  });

  it('Uspešna prijava z veljavnimi podatki', () => {
    cy.get('input#email').type('tevz7star@gmail.com');
    cy.get('input#password').type('123456#');
    cy.get('button').contains('Prijava').click();
    cy.url().should('not.include', '/auth/login');
    cy.contains('Dashboard').should('exist');
  });

  it('Redirect za neavtenticiranega uporabnika', () => {
    cy.clearCookies();
    cy.clearLocalStorage();
    cy.visit('/dashboard');
    cy.url().should('include', '/auth/login');
    cy.contains('Prijava v Omrežnina+').should('be.visible');
  });
});


describe('Registracija', () => {
  beforeEach(() => {
    cy.visit('/auth/register');
  });

  it('Prikaz obrazca za registracijo', () => {
    cy.contains('Registracija v Omrežnina+').should('be.visible');
    cy.get('input#name').should('exist');
    cy.get('input#email').should('exist');
    cy.get('input#password').should('exist');
    cy.get('input#confirm-password').should('exist');
  });

  it('Napaka: prazna polja', () => {
    cy.get('button').contains('Registracija').click();
    cy.contains('Vnesite svoje ime.').should('be.visible');
  });

  it('Napaka: prazno ime je prvo validacijsko sporočilo', () => {
    cy.get('input#email').type('nekaj@example.com');
    cy.get('input#password').type('Test123!');
    cy.get('input#confirm-password').type('Test123!');
    cy.get('button').contains('Registracija').click();
    cy.contains('Vnesite svoje ime.').should('be.visible');
  });

  it('Napaka: prazno polje za email', () => {
    cy.get('input#name').type('Janez Novak');
    cy.get('input#password').type('Test123!');
    cy.get('input#confirm-password').type('Test123!');
    cy.get('button').contains('Registracija').click();
    cy.contains('Vnesite email naslov.').should('be.visible');
  });

it('Napaka: napačen email', () => {
  cy.get('input#name').type('Janez Novak');
  cy.get('input#email').type('napacenemail');
  cy.get('input#password').type('Test123!');
  cy.get('input#confirm-password').type('Test123!');
  cy.get('button').contains('Registracija').click();

  cy.wait(200);

  cy.get('body').then(($body) => {
    const customError = $body.find('p').filter((i, el) =>
      !!el.textContent?.includes("Email mora vsebovati znak '@'.")
    );

    const nativeInvalid = $body.find('input#email:invalid');

    expect(customError.length > 0 || nativeInvalid.length > 0).to.be.true;
  });
  });


  it('Napaka: gesli se ne ujemata', () => {
    cy.get('input#name').type('Janez Novak');
    cy.get('input#email').type('janez@example.com');
    cy.get('input#password').type('TestnoGeslo!1');
    cy.get('input#confirm-password').type('DrugoGeslo!2');
    cy.get('button').contains('Registracija').click();
    cy.contains('Gesli se ne ujemata.').should('be.visible');
  });

  it('Napaka: geslo brez simbola', () => {
    cy.get('input#name').type('Janez Novak');
    cy.get('input#email').type('janez@example.com');
    cy.get('input#password').type('Geslo123');
    cy.get('input#confirm-password').type('Geslo123');
    cy.get('button').contains('Registracija').click();
    cy.contains('Geslo mora vsebovati simbol.').should('be.visible');
  });

  it('Napaka: geslo brez številke', () => {
    cy.get('input#name').type('Janez Novak');
    cy.get('input#email').type('janez@example.com');
    cy.get('input#password').type('Geslo!');
    cy.get('input#confirm-password').type('Geslo!');
    cy.get('button').contains('Registracija').click();
    cy.contains('Geslo mora vsebovati številko.').should('be.visible');
  });

  it('Napaka: geslo prekratko', () => {
    cy.get('input#name').type('Janez Novak');
    cy.get('input#email').type('janez@example.com');
    cy.get('input#password').type('G!');
    cy.get('input#confirm-password').type('G!');
    cy.get('button').contains('Registracija').click();
    cy.contains('Geslo mora imeti vsaj 6 znakov.').should('be.visible');
  });

  it('Uspešna registracija', () => {
    const random = Math.floor(Math.random() * 100000);
    cy.get('input#name').type('Test User');
    cy.get('input#email').type(`testuser${random}@mail.com`);
    cy.get('input#password').type('TestnoGeslo!1');
    cy.get('input#confirm-password').type('TestnoGeslo!1');
    cy.get('button').contains('Registracija').click();
    cy.contains('Registracija uspešna!').should('exist');
  });

  it('Preusmeritev na prijavo', () => {
    cy.contains('Prijava').click();
    cy.url().should('include', '/auth/login');
  });
});