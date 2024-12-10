describe('Change of User', { testIsolation: false }, () => {
    before(() => {
        Cypress.session.clearAllSavedSessions()

        //login user
        cy.login('PA0G09FA0B', 'Test@123');
        cy.intercept('acl/api/v1/accounts/userprofiledetails').as('getProfilePhoto');
        cy.wait('@getProfilePhoto');
    });

    it('should verify logged in user', () => {
        cy.get('.greetings').should('contain', 'Hi Monicah, welcome');
    });

    it('should navigate to Change Of User Applications', () => {
        cy.xpath("//app-home-user-dashboard[1]/mat-card[1]/mat-card-content[1]/div[1]/div[2]/div[2]/div[1]/div[2]/div[2]/button[1]")
            .should('contain', 'View More').click()
        cy.contains('Development Control').should('be.visible').click();
        cy.contains('Change of User').should('be.visible').click();
    })

    it('should verify page and initiate new application ', () => {
        cy.url().should('include', '/user/MoLPP/land-admin/development-control/processes/CHANGE%20OF%20USER');
        cy.contains('Change Of User Applications').should('exist')
        cy.contains('button', 'New Application').should('be.visible').click();
    })

    it('should verify FAQs tab', () => {
        cy.contains('Frequently Asked Questions').should('be.visible')
        cy.contains('button', 'Next').should('exist').click({ force: true });
    })

    it('should navigate to application details tab and fill application data', () => {
        //Process data
        cy.contains('Application details').should('be.visible')

        cy.get('[formcontrolname="application_type"]').click();
        cy.get('.mat-option')
            .contains('Change Of User')
            .should('be.visible')
            .click();

        cy.get('[formcontrolname="change_user_to"]').click();
        cy.get('.mat-option')
            .contains('Agricultural')
            .should('be.visible')
            .click();

        // cy.get('[formcontrolname="parcel_number"]').type('NAIROBI/BLOCK111/1079')
        cy.get('[formcontrolname="parcel_number"]').type('NAIROBI/BLOCK153/58')
        cy.get('input[formcontrolname="ppa2_reference_number"]').type('PLUPA 12345')
        cy.get('textarea[formcontrolname="land_status"]').type('In Use');
        cy.get('textarea[formcontrolname="additional_information"]').type('None');

        // //Select ppa2 date
        cy.get('mat-datepicker-toggle').click();
        cy.wait(500);
        cy.get('.mat-calendar-period-button').click();
        cy.contains('2010').click({ force: true });
        cy.get('.mat-calendar-body-cell').contains('OCT').click();
        cy.get('.mat-calendar-body-cell').contains('10').click();

        // //Verify selected date
        cy.get('input[formcontrolname="ppa2_date"]')
            .invoke('val')
            .should('include', '10/10/2010');

        cy.contains('button', 'Next').should('exist').click({ force: true });
    })

    it('should navigate to attach files tab and upload files', () => {
        cy.contains('Attach files').should('be.visible')

        cy.get('#upload_ppa2').should('be.visible')
        // cy.get('button.form_upload_button').first().click();
        cy.get('#ppa2').selectFile('cypress/fixtures/file.png', { force: true })

        cy.get('#upload_title_deed').should('be.visible')
        // cy.get('button.form_upload_button').eq(3).click();
        cy.get('#title_deed').selectFile('cypress/fixtures/file.png', { force: true })

        cy.get('button.form_upload_button').eq(1).should('be.visible')
        cy.get('#local_dailies_notice').selectFile('cypress/fixtures/file.png', { force: true })

        cy.get('button.form_upload_button').eq(2).should('be.visible')
        cy.get('#planning_brief').selectFile('cypress/fixtures/file.png', { force: true })

        cy.get('button.form_upload_button').eq(4).should('be.visible')
        cy.get('#notice_on_site').selectFile('cypress/fixtures/file.png', { force: true })

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

        cy.get('table').then(($tables) => {
            const tableCount = $tables.length;
            cy.log('Number of tables: ' + tableCount);

            $tables.each((index, table) => {
                cy.wrap(table).find('tr').should('have.length.greaterThan', 0);
            });
        });

        //Submit application
        cy.contains('button', 'Submit').should('exist').click({ force: true });
    })

    it('should display confirmation dialog with correct text and buttons', () => {
        cy.get('mat-dialog-container')
            .should('be.visible')
            .find('.mat-dialog-content')
            .should('contain', 'Are you sure?')
            .and('contain', 'Are you sure you want to submit the request!');

        cy.get('mat-dialog-container')
            .find('button#no')
            .should('be.visible')
            .and('contain', 'No')
            .click();

        //Resubmit application
        cy.contains('button', 'Submit').should('exist').click({ force: true });

        cy.get('mat-dialog-container')
            .find('button.continue-button')
            .should('be.visible')
            .and('contain', 'Yes')
            .click();

        //intercept post request
        cy.intercept('POST', ' http://192.168.214.184/sharedservice/api/v1/file-upload/upload').as('createApplication')
        cy.wait('@createApplication', { timeout: 60000 })


        cy.wait(5000);
        cy.get('.swal2-content')
            .should('exist')
            .invoke('text')
            .then((text) => {
                expect(text.trim()).to.include('Application Initiated Successfully');
            });

        cy.xpath("//button[normalize-space()='Close']").should('be.visible').click()
    });

    it('should show application progress level', () => {
        cy.wait(2000);
        cy.contains('Progress level: Application received, awaiting payment confirmation').should('be.visible')
    })

    it('should authorize development control application development control', () => {
        cy.wait(2000);

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

    // it('should view uploaded documents', () => {
    //     cy.contains('Documents').click()
    // })

    // it('should cancel submission', () => { })

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

    it('verify submission', () => {
        cy.wait(2000);
        cy.get('.swal2-content')
            .should('exist')
            .invoke('text')
            .then((text) => {
                expect(text.trim()).to.include('Request processed successfully');
            });

        cy.xpath("//button[normalize-space()='Close']").should('be.visible').click()
    })
})