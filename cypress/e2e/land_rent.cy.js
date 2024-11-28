describe('Land Rent Process', { testIsolation: false }, () => {
    before(() => {
        Cypress.session.clearAllSavedSessions()

        cy.login('PA0G09FA0B', 'Test@123');
        cy.intercept('acl/api/v1/accounts/userprofiledetails').as('getProfilePhoto');
        cy.wait('@getProfilePhoto');
    });

    it('should verify logged in user', () => {
        cy.get('.greetings').should('contain', 'Hi Monicah, welcome');
    });

    describe('Pay Land rent', () => {
        it('should navigate to land rent section', () => {
            cy.contains('Land Rent').should('be.visible').click();
            cy.url().should('include', 'user/MoLPP/land-admin/land-rent/applications');
            cy.contains('a', 'Click on this Youtube Link for a step by step guide on Rent Payment').should('be.visible');   //check for youtube link
            cy.contains('button', 'Pay Land Rent').should('be.visible').click();
        });

        it('should search for land parcel', () => {
            cy.get('input[formcontrolname="parcel_number"]').type('NAIROBI/BLOCK107/1223');
            cy.contains('button', 'Search').click();
        });

        it('should select the first/most recent entry on the results table', () => {
            cy.get('.invoice_table tbody tr:nth-child(1) td:nth-child(1) input[type="checkbox"]')
                .check({ force: true });

            cy.get('.invoice_table tbody tr:nth-child(1) td:nth-child(7)')
                .contains('Pending')
                .should('exist');
        })

        it('should view and download invoice', () => {
            cy.get('.invoice_table tbody tr:nth-child(1) td:nth-child(8) button')
                .contains('View')
                .click();
            cy.contains('button', 'Invoice').click();

            //verify download page
            cy.url().should('include', 'user/invoice-view-details');
            cy.contains('Application Invoice Details')
            cy.contains('button', 'Download').click();

            cy.wait(2000)
            cy.contains('button', 'Back').click();

        })

        it('should initiate payment process', () => {
            cy.wait(3000);
            cy.get('.invoice_table tbody tr:nth-child(1) td:nth-child(8) button')
                .contains('Pay')
                .click();

            cy.contains('button', 'Mock Payments').click({ force: true });
        })

        it('should navigate to completed applications and download payment receipt', () => {
            cy.visit('user/MoLPP/land-admin/land-rent/applications')
            cy.get('.invoice_table tbody tr:nth-child(1) td:nth-child(6)')
                .contains('Complete')
                .should('exist');

            cy.get('.invoice_table tbody tr:nth-child(1) td:nth-child(7) button')
                .contains('View')
                .click();
            cy.contains('button', 'Receipt').click();

            //verify download page
            cy.url().should('include', 'user/invoice-view-details');
            cy.contains('Application Invoice Details')
            cy.contains('button', 'Download').click();

            cy.wait(2000)
            cy.contains('button', 'Back').click();
        });
    });

    describe('Generate Clearance certificate', () => {
        it('should generate', () => {
            // cy.visit('user/MoLPP/land-admin/land-rent/applications')
            cy.wait(5000);
            cy.contains('Get Clearance').should('be.visible').click();

            cy.get('input[formcontrolname="parcel_number"]').type('NAIROBI/BLOCK107/1223');
            cy.contains('button', 'Get').click();
        })
    })
})


