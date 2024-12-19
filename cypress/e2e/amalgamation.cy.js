describe('Amalgamation Process', { testIsolation: false }, () => {
    before(() => {
        Cypress.session.clearAllSavedSessions()

        cy.login('PA0G09FA0B', 'Test@123');
        cy.intercept('acl/api/v1/accounts/userprofiledetails').as('getProfilePhoto');
        cy.wait('@getProfilePhoto');
    });

    it('should verify logged in user', () => {
        cy.get('.greetings').should('contain', 'Hi Monicah, welcome');
    });

    it('should navigate to Amalgamation Applications', () => {
        cy.xpath("//app-home-user-dashboard[1]/mat-card[1]/mat-card-content[1]/div[1]/div[2]/div[2]/div[1]/div[2]/div[2]/button[1]")
            .should('contain', 'View More').click()
        cy.contains('Development Control').should('be.visible').click();
        cy.contains('Amalgamation').should('be.visible').click();
    })

    it('should verify page and initiate new application ', () => {
        cy.url().should('include', '/user/MoLPP/land-admin/development-control/processes/AMALGAMATION');
        cy.contains('Amalgamation Applications').should('exist')
        cy.contains('button', 'New Application').should('be.visible').click();
    })

    it('should verify FAQs tab', () => {
        cy.contains('Frequently Asked Questions').should('be.visible')
        cy.contains('button', 'Next').should('exist').click({ force: true });
    })

    it('should navigate to application details tab and fill application data', () => {
        cy.contains('Application details').should('be.visible')

        cy.get('[formcontrolname="application_type"]').click();
        cy.get('.mat-option')
            .contains('Amalgamation')
            .should('be.visible')
            .click();

        cy.get('[formcontrolname="change_user_to"]').click();
        cy.get('.mat-option')
            .contains('Agricultural')
            .should('be.visible')
            .click();

        cy.contains('label', "Add change of user").find('input[type="radio"]').check({ force: true });
        cy.contains('label', "Don't add change of user").find('input[type="radio"]').should('be.visible');

        // cy.get('[formcontrolname="parcel_number"]').type('NAIROBI/BLOCK111/1079')
        // cy.get('[formcontrolname="parcel_number"]').type('NAIROBI/BLOCK102/115')
        cy.get('input[formcontrolname="ppa2_reference_number"]').type('PLUPA 12345')
        cy.get('textarea[formcontrolname="land_status"]').type('In Use');
        cy.get('textarea[formcontrolname="additional_information"]').type('None');



        // //Select ppa2 date
        cy.get('mat-datepicker-toggle').click();
        cy.get('mat-calendar').within(() => {
            cy.get('.mat-calendar-period-button').click();
            cy.contains('.mat-calendar-body-cell', '2010').click({ force: true });
            cy.contains('.mat-calendar-body-cell', 'OCT').click();
            cy.contains('.mat-calendar-body-cell', '10').click();
        });

        //Verify selected date
        cy.get('input[formcontrolname="ppa2_date"]')
            .invoke('val')
            .should('include', '10/10/2010');


        //Enter parcel numbers
        const parcelNumbers = ['NAIROBI/BLOCK125/395','NAIROBI/BLOCK125/397'];

        parcelNumbers.forEach(parcelNumber => {
            cy.contains('button', 'Add').click();

            cy.get('mat-dialog-container').within(() => {
                cy.contains('Add Sub-plot');
                cy.contains('Parcel Number');
                cy.get('[formcontrolname="parcel_number"]').type(parcelNumber);
                cy.contains('button', 'Add')
                    .and('not.be.disabled')
                    .click({force: true});
            });
        });

        cy.contains('button', 'Next').should('exist').click({ force: true });
    })

    it('should navigate to attach files tab and upload files', () => {
        cy.contains('Attach files').should('be.visible')

        cy.get('#upload_ppa2').should('be.visible')
        cy.get('#ppa2').selectFile('cypress/fixtures/file.png', { force: true })

        cy.get('#upload_title_deed').should('be.visible')
        // cy.get('button.form_upload_button').eq(3).click();
        cy.get('#title_deed').selectFile('cypress/fixtures/file.png', { force: true })

        cy.get('button.form_upload_button').eq(1).should('be.visible')
        cy.get('#planning_brief').selectFile('cypress/fixtures/file.png', { force: true })

        cy.get('input[formcontrolname="scheme_plan"]').selectFile('cypress/fixtures/file.png', { force: true })
        cy.get('input[formcontrolname="shape_file"]').selectFile('cypress/fixtures/shapefile.zip', { force: true })


        cy.contains('h3', 'Additional documents').should('be.visible').click()

        //additional documents
        cy.get('input[formcontrolname="document_name"]').clear().type('National Id');
        cy.get('#choose_other_doc').should('exist')
        cy.get('#otherFiles').selectFile('cypress/fixtures/file.png', { force: true });

        cy.get('input[formcontrolname="document_name"]').clear().type('Agreement Form');
        cy.get('#choose_other_doc').should('exist')
        cy.get('#otherFiles').selectFile('cypress/fixtures/file.png', { force: true });

        cy.wait(1000);

        //Test "Remove" feature on table
        cy.get("div[fxlayoutalign='start start'] div table[role='grid'] tbody tr")
            .each(($row, index) => {
                cy.wrap($row).find('td').each(($col, colIndex) => {
                    if ($col.text().includes('National Id')) {
                        cy.wrap($row).find('td').eq(colIndex + 1).find('button').should('contain.text', 'Remove').click({ force: true })
                    }
                });
            });

        //Next
        cy.contains('button', 'Next').should('exist').click({ force: true });
    })

    it('should navigate to verify details tab', () => {
        cy.contains('Verify Details').should('be.visible')
        cy.get('table').each(($table) => {
            cy.wrap($table).find('tr').should('have.length.greaterThan', 0);
        });

        cy.contains('button', 'Submit')
            .should('exist')
            .click({ force: true });
    })

    it('should display confirmation dialog with correct text and buttons', () => {
        cy.get('mat-dialog-container')
            .should('be.visible')
            .find('.mat-dialog-content')
            .should('contain', 'Are you sure?')
            .and('contain', 'Are you sure you want to submit the request!');

        // Click 'No' and resubmit application
        cy.get('mat-dialog-container').find('button#no')
            .should('be.visible')
            .and('contain', 'No')
            .click();

        cy.contains('button', 'Submit').click({ force: true });

        // Click 'Yes' 
        cy.get('mat-dialog-container').find('button.continue-button')
            .should('be.visible')
            .and('contain', 'Yes')
            .click();

        // Intercept POST request and wait for response
        cy.intercept('POST', 'http:///api/v1/file-upload/upload').as('createApplication');
        cy.wait('@createApplication', { timeout: 60000 });

        // Validate success message
        cy.wait(3000);
        cy.get('.swal2-content')
            .should('exist')
            .invoke('text')
            .should('include', 'Application Initiated Successfully');

        cy.xpath("//button[normalize-space()='Close']").click();
    });

    it('should show application progress level and authorize development control application', () => {
        cy.wait(2000);
        cy.contains('Progress level: Application received, awaiting payment confirmation').should('be.visible')

        cy.contains('.mat-tab-label-content', 'Application Details').click()
        cy.contains('button', 'Get OTP').click()
        // cy.get('input.search_input').type('123456')
        cy.pause()
        cy.contains('button', 'Verify').click()

        cy.wait(2000);
        cy.get('.swal2-content')
            .should('exist')
            .invoke('text')
            .then((text) => {
                expect(text.trim()).to.include('OTP Successfully verified!');
            });

        cy.xpath("//button[normalize-space()='Close']").should('be.visible').click()
    })

    it('should submit request', () => {
        cy.contains('button', 'Submit Request').click()

        cy.get('mat-dialog-container')
            .should('be.visible')
            .find('.mat-dialog-content')
            .should('contain', 'Are you sure?')
            .and('contain', 'Are you sure you want to submit the request?');

        cy.get('mat-dialog-container')
            .find('button.continue-button')
            .should('be.visible')
            .and('contain', 'Yes')
            .click();
    })

    it('should verify submission', () => {
        cy.wait(2000);
        cy.get('.swal2-content')
            .should('exist')
            .invoke('text')
            .then((text) => {
                expect(text.trim()).to.include('Request processed successfully');
            });

        cy.xpath("//button[normalize-space()='Close']").click()
    })
})