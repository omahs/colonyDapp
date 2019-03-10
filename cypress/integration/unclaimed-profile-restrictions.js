describe('Unclaimed Profile Restrictions', () => {
  it('Connects to the dApp', () => {
    cy.visit('/connect');
  });

  /*
   * So we can ensure the wallet is empty
   * And also test logging in this way
   */
  it('Use a software wallet (mnemonic phrase)', () => {
    cy.get('button')
      .contains('Mnemonic Phrase')
      .click();

    /*
     * Get mnemonic phrase from fixtures
     */
    cy.fixture('accounts').then(({ mnemonic }) => {
      /*
       * Fill the menmonic Phrase Textarea
       */
      cy.get('#connectwalletmnemonic').type(mnemonic);
    });

    /*
     * Click on the button to go to the dApp
     */
    cy.get('button')
      .contains('Go to Colony')
      .click()
      .wait(2000);
  });

  it('Tries to leave a comment on the first task', () => {
    /*
     * Go to the first task in the dashboard list
     */
    cy.get('table[data-test="dashboardTaskList"] tr')
      .first()
      .click();

    cy.get('#comment')
      /*
       * Use force because it's disabled (as it should)
       */
      .click({ force: true })
      .then(() => {
        cy.get('p[data-test="claimProfileDialog"]').should('exist');
      });

    /*
     * Go back to the dashboard
     */
    cy.goToDashboard();
  });

  it('Tries to request to work on the first task', () => {
    /*
     * Go to the first task in the dashboard list
     */
    cy.get('table[data-test="dashboardTaskList"] tr')
      .first()
      .click();

    cy.get('button[data-test="requestWorkButton"]')
      .click()
      .then(() => {
        cy.get('p[data-test="claimProfileDialog"]').should('exist');
      });

    /*
     * Go back to the dashboard
     */
    cy.goToDashboard();
  });
});
