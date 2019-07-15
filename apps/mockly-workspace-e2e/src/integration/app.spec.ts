import { getGreeting } from '../support/app.po';

describe('mockly-workspace', () => {
  beforeEach(() => cy.visit('/'));

  it('should display welcome message', () => {
    getGreeting().contains('Welcome to mockly-workspace!');
  });
});
