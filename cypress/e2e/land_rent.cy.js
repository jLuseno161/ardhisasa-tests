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

    describe('Pay land rent single invoice', () => {
        it('should navigate to land rent section', () => {
            cy.contains('Land Rent').should('be.visible').click();
            cy.url().should('include', 'user/MoLPP/land-admin/land-rent/applications');
            cy.contains('a', 'Click on this Youtube Link for a step by step guide on Rent Payment').should('be.visible');   //check for youtube link
            cy.contains('button', 'Pay Land Rent').should('be.visible').click();
        });

        it('should search for land parcel', () => {
            cy.get('input[formcontrolname="parcel_number"]').type('NAIROBI/BLOCK153/58');
            cy.contains('button', 'Search').click();
        });

        it('should select the first/most recent entry on the results table', () => {
            cy.get('.invoice_table tbody tr:nth-child(1) td:nth-child(1) input[type="checkbox"]').check({ force: true });
            cy.get('.invoice_table tbody tr:nth-child(1) td:nth-child(7)')
                .contains('Pending')
                .should('exist');
        })

        it('should view and download invoice', () => {
            cy.get('.invoice_table tbody tr:nth-child(1) td:nth-child(8) button')
                .contains('View')
                .click();

            cy.contains('button', 'Invoice').click();
            cy.url().should('include', 'user/invoice-view-details');
            cy.contains('Application Invoice Details')
            cy.contains('button', 'Download').click();
            cy.wait(2000)
            cy.contains('button', 'Back').click();
        })

        it('should initiate payment process', () => {
            cy.wait(2000);
            cy.get('.invoice_table tbody tr:nth-child(1) td:nth-child(8) button')
                .contains('Pay')
                .click();
            cy.contains('button', 'Mock Payments').click();
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

    describe('Pay land rent multiple invoices', () => {
        it('should navigate to land rent section', () => {
            cy.visit('user/MoLPP/land-admin/land-rent/pay-land-rent?parcel_number=')
        });

        it('should search for land parcel', () => {
            cy.get('input[formcontrolname="parcel_number"]').type('NAIROBI/BLOCK153/58');
            cy.contains('button', 'Search').click();
        });

        it('should select all entries on the results table', () => {
            cy.get('.invoice_table thead tr th:nth-child(1) input[type="checkbox"]').check({ force: true });
            cy.contains('button', 'Consolidate').should('be.visible').click();

            cy.get('mat-dialog-container')
                .should('be.visible')
                .find('.mat-dialog-content')
                .should('contain', 'Are you sure?')
                .and('contain', 'Are you sure you want to consolidate the selected invoices?');

            cy.get('mat-dialog-container')
                .find('button#no')
                .should('be.visible')
                .and('contain', 'No')

            cy.get('mat-dialog-container')
                .find('button.continue-button')
                .should('be.visible')
                .and('contain', 'Yes')
                .click();

            cy.contains('Consolidated Invoices').click({ force: true })
        })

        it('should view and download invoices', () => {
            cy.contains('button', 'View').click();
            cy.contains('button', 'Back').click();
        })

        it('should initiate payment process', () => {
            cy.contains('Consolidated Invoices').click({ force: true })
            cy.wait(2000);
            cy.contains('button', 'Pay').should('be.visible').click({ force: true });
            cy.contains('button', 'Mock Payments').click({ force: true });
        })
    });

    describe('Generate Clearance certificate', () => {
        it('should generate clearance certificate', () => {
            cy.visit('user/MoLPP/land-admin/land-rent/applications')
            cy.wait(5000);
            cy.contains('Get Clearance').should('be.visible').click();
            cy.get('input[formcontrolname="parcel_number"]').type('NAIROBI/BLOCK153/58');
            cy.contains('button', 'Get').click();
            cy.contains('Click here to download Clearance certificate')
            cy.contains('button', 'Rent Clearance').click();
        })
    })
})


