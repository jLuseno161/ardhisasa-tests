//xpath
require('cypress-xpath');

//custom login
Cypress.Commands.add('login', (username, password) => {
    
    cy.session(
        [username, password], () => {
            cy.visit('/home')
            cy.contains('Ardhisasa')
            cy.xpath("//a[@routerlink='/account']").should('be.visible').click();
            cy.contains('Login')

            cy.get('input[formcontrolname="username"]').type(username)
            cy.get('input[formcontrolname="password"]').type(password)

            cy.xpath("//button[@type='submit']").should('be.visible').click();
            cy.get('button#verify').should('exist').click();
        },
        {
            validate() {
                cy.request('/whoami').its('status').should('eq', 200)
            },
        }
    )
})

// Cypress.Commands.add('login', (username, password) => {
//     cy.visit('/home')
//     cy.contains('Ardhisasa')
//     cy.xpath("//a[@routerlink='/account']").should('be.visible').click();
//     cy.contains('Login')

//     cy.get('input[formcontrolname="username"]').type(username)
//     cy.get('input[formcontrolname="password"]').type(password)

//     cy.xpath("//button[@type='submit']").should('be.visible').click();
//     cy.get('button#verify').should('exist').click();

//  });
