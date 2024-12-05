describe('Consolidated Processes', { testIsolation: false }, () => {
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

    it('should navigate to Consolidated Processes section ', () => {
        cy.xpath("//app-home-user-dashboard[1]/mat-card[1]/mat-card-content[1]/div[1]/div[2]/div[2]/div[1]/div[2]/div[2]/button[1]")
            .should('contain', 'View More').click()

        //Navigate to conconsolidated process in development control
        cy.contains('Development Control').should('be.visible').click();

        cy.contains('Consolidated Processes').should('be.visible').click();
    })

    it('should verify page and initiate new application ', () => {
        //verify url and new application page
        cy.url().should('include', '/user/MoLPP/land-admin/development-control/consolidated-processes');
        cy.contains('Consolidated Processes Application').should('exist')

        //initiate new application and verify each tab
        cy.contains('button', 'New Application').should('exist').click();
        cy.contains('Frequently Asked Questions').should('be.visible')
        cy.contains('button', 'Next').should('exist').click();
    })

    it('should navigate to application details tab and fill application data', () => {
        //Processes data
        cy.contains('Application details').should('be.visible')
        const processes = ['Amalgamation', 'Change Of User', 'Extension Of Lease'];
        processes.forEach(process => {
            cy.get('[formcontrolname="application_type"]')
                .click();

            cy.get('.mat-option')
                .contains(process)
                .should('be.visible')
                .click();

            cy.contains('button', 'ADD').should('exist').click();
        });

        //Test "Remove" button in table
        cy.xpath("//new-consolidated-processes[1]/div[1]/mat-card[1]/mat-card-content[1]/mat-horizontal-stepper[1]/div[2]/div[2]/form[1]/div[3]/table[1]//tbody//tr").should('exist')
        cy.get("div[class='row_section_margins'] table[role='grid'] tbody tr")
            .each(($row, index) => {
                cy.wrap($row).find('td').each(($col, colIndex) => {
                    if ($col.text().includes('Change of user')) {
                        cy.wrap($row).find('td').eq(colIndex + 1).find('button').should('contain.text', 'Remove').click()
                    }
                });
            });

        // cy.get("div[class='row_section_margins'] table[role='grid'] tbody tr")
        //     .each(($row, index) => {
        //         cy.wrap($row).within(() => {
        //             cy.get('td').each(($col, colIndex) => {
        //                 if ($col.text().includes('Change of user')) {
        //                     cy.get('td').eq(colIndex + 1).find('button').should('contain.text', 'Remove').click();
        //                 }
        //             });
        //         });
        //     });

        //Parcel data
        const parcels = ['NAIROBI/BLOCK107/1223', 'NAIROBI/BLOCK111/1000', 'NAIROBI/BLOCK125/395',];

        parcels.forEach(parcel => {
            cy.get('input[formcontrolname="parcel_number"]').type(parcel)
            cy.contains('button', 'Add').click();
        });

        //Test "Remove" button in table
        cy.xpath("//new-consolidated-processes[1]/div[1]/mat-card[1]/mat-card-content[1]/mat-horizontal-stepper[1]/div[2]/div[2]/form[1]/div[7]/table[1]//tbody//tr")
            .each(($row, index) => {
                cy.wrap($row).find('td').each(($col, colIndex) => {
                    if ($col.text().includes('Nairobi/block111/1000')) {
                        cy.wrap($row).find('td').find('button').should('contain.text', 'Remove').click()
                    }
                });
            });

        //Form data
        cy.xpath("//input[@id='mat-chip-list-input-0']").should('exist').type('PLUPA 12345')
        cy.get('textarea[formcontrolname="land_status"]').type('In Use');
        cy.get('textarea[formcontrolname="additional_information"]').type('None');

        //Select date
        cy.get('mat-datepicker-toggle').click();
        cy.wait(500);
        cy.get('.mat-calendar-period-button').click();
        cy.contains('2010').click();
        cy.get('.mat-calendar-body-cell').contains('OCT').click();
        cy.get('.mat-calendar-body-cell').contains('10').click();

        //Verify selected date
        cy.get('input[formcontrolname="ppa2_date"]')
            .invoke('val')
            .should('include', '10/10/2010');

        // Next
        cy.contains('button', 'Next').should('exist').click({ force: true });
    })

    it('should navigate to attach files tab and upload files', () => {
        cy.get('#upload_ppa2').should('exist').click()
        cy.get('input[formcontrolname="common_ppa2"]').selectFile('cypress/fixtures/file.png', { force: true })

        cy.get('#upload_title_deed').should('exist').click()
        cy.get('input[formcontrolname="common_title_deed"]').selectFile('cypress/fixtures/file.png', { force: true })

        cy.get('#upload_title_deed').should('exist').click()
        cy.get('input[formcontrolname="common_planning_brief"]').selectFile('cypress/fixtures/file.png', { force: true })

        // cy.xpath("//mat-horizontal-stepper//form//div[1]//button").should('exist');
        cy.xpath("//new-consolidated-processes[1]/div[1]/mat-card[1]/mat-card-content[1]/mat-horizontal-stepper[1]/div[2]/div[3]/form[1]/div[4]/div[1]/div[1]/button[1]").should('exist').click()
        cy.get('input[formcontrolname="amalgamation_scheme_plan"]').selectFile('cypress/fixtures/file.png', { force: true })

        // cy.xpath("//mat-horizontal-stepper//form//div[2]//button").should('exist');
        cy.xpath("//new-consolidated-processes[1]/div[1]/mat-card[1]/mat-card-content[1]/mat-horizontal-stepper[1]/div[2]/div[3]/form[1]/div[4]/div[2]/div[1]/button[1]").should('exist').click()
        cy.get('input[formcontrolname="amalgamation_shape_file"]').selectFile('cypress/fixtures/shapefile.zip', { force: true })

        cy.get('input[formcontrolname="document_name"]').type('National Id')
        cy.get('#choose_other_doc').should('exist').click()
        cy.get('#otherFiles').selectFile('cypress/fixtures/file.png', { force: true })

        cy.get('input[formcontrolname="document_name"]').type('Agreement Form')
        cy.get('#choose_other_doc').should('exist').click()
        cy.get('#otherFiles').selectFile('cypress/fixtures/file.png', { force: true })
        cy.wait(2000);

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
        //Check that each table has some data
        cy.get('table').then(($tables) => {
            const tableCount = $tables.length;
            cy.log('Number of tables: ' + tableCount);

            $tables.each((index, table) => {
                cy.wrap(table).find('tr').should('have.length.greaterThan', 0);
            });
        });

        //Submit
        cy.contains('button', 'Submit').should('exist').click({ force: true });
    })
    it('should display confirmation dialog with correct text and buttons', () => {

        // Verify the dialog contains the correct text
        cy.get('mat-dialog-container')
            .should('be.visible')
            .find('.mat-dialog-content')
            .should('contain', 'Are you sure?')
            .and('contain', 'Are you sure you want to submit the request!');

        // Verify the "No" button exists and is clickable
        cy.get('mat-dialog-container')
            .find('button#no')
            .should('be.visible')
            .and('contain', 'No')
            .click();

        cy.wait(3000);

        //Resubmit application
        cy.contains('button', 'Submit').should('exist').click({ force: true });

        // Verify the "Yes" button exists and is clickable
        cy.get('mat-dialog-container')
            .find('button.continue-button')
            .should('be.visible')
            .and('contain', 'Yes')
            .click();
    });

})

