describe('Meeting Room', () => {
  beforeEach(() => {
    // Mock API responses
    cy.intercept('GET', '/api/meetings/*', {
      statusCode: 200,
      body: {
        id: 'test-meeting',
        matrixRoomId: 'test-room',
        status: 'scheduled',
      },
    });

    // Mock Matrix API
    cy.intercept('POST', '*/_matrix/client/r0/login', {
      statusCode: 200,
      body: {
        access_token: 'test-token',
        user_id: '@test:matrix.org',
      },
    });

    // Visit meeting room
    cy.visit('/meeting/test-meeting');
  });

  it('loads meeting room successfully', () => {
    // Check main components are present
    cy.get('#jitsi-container').should('exist');
    cy.get('.chat-container').should('exist');
    
    // Check loading state is removed
    cy.get('.loading-indicator').should('not.exist');
  });

  it('shows recording controls for host', () => {
    // Mock as host
    cy.window().then((win) => {
      win.localStorage.setItem('isHost', 'true');
    });

    cy.reload();

    // Check recording button is present
    cy.get('[data-testid="recording-button"]')
      .should('exist')
      .and('contain.text', 'Start Recording');
  });

  it('handles recording toggle', () => {
    // Mock as host
    cy.window().then((win) => {
      win.localStorage.setItem('isHost', 'true');
    });

    cy.reload();

    // Start recording
    cy.get('[data-testid="recording-button"]')
      .click()
      .should('contain.text', 'Stop Recording');

    // Stop recording
    cy.get('[data-testid="recording-button"]')
      .click()
      .should('contain.text', 'Start Recording');
  });

  it('sends and receives chat messages', () => {
    const testMessage = 'Hello, world!';

    // Type and send message
    cy.get('[data-testid="chat-input"]')
      .type(testMessage)
      .type('{enter}');

    // Check message appears in chat
    cy.get('.chat-message')
      .should('contain.text', testMessage);
  });

  it('handles file uploads', () => {
    // Mock file upload
    cy.get('[data-testid="file-upload"]')
      .attachFile('test.jpg');

    // Check file preview
    cy.get('.file-preview')
      .should('exist')
      .and('contain.text', 'test.jpg');
  });

  it('shows error toast on API failure', () => {
    // Mock API error
    cy.intercept('GET', '/api/meetings/*', {
      statusCode: 500,
      body: { error: 'Server error' },
    });

    cy.reload();

    // Check error toast
    cy.get('.toast')
      .should('exist')
      .and('contain.text', 'Failed to join the meeting');
  });

  it('handles meeting end', () => {
    // Mock as host
    cy.window().then((win) => {
      win.localStorage.setItem('isHost', 'true');
    });

    cy.reload();

    // End meeting
    cy.get('[data-testid="end-meeting-button"]').click();

    // Check confirmation dialog
    cy.get('.confirmation-dialog')
      .should('exist')
      .and('contain.text', 'End meeting?');

    // Confirm end meeting
    cy.get('[data-testid="confirm-end-meeting"]').click();

    // Check redirect
    cy.url().should('include', '/dashboard');
  });

  it('maintains connection on network issues', () => {
    // Simulate offline
    cy.window().then((win) => {
      win.dispatchEvent(new Event('offline'));
    });

    // Check reconnection message
    cy.get('.connection-status')
      .should('exist')
      .and('contain.text', 'Reconnecting');

    // Simulate online
    cy.window().then((win) => {
      win.dispatchEvent(new Event('online'));
    });

    // Check connection restored
    cy.get('.connection-status')
      .should('not.exist');
  });

  it('handles screen sharing', () => {
    // Click screen share button
    cy.get('[data-testid="screen-share-button"]').click();

    // Check screen share is active
    cy.get('.screen-share-indicator')
      .should('exist')
      .and('contain.text', 'Screen sharing active');
  });

  it('supports whiteboard collaboration', () => {
    // Open whiteboard
    cy.get('[data-testid="whiteboard-button"]').click();

    // Check whiteboard is visible
    cy.get('.whiteboard-container').should('be.visible');

    // Draw something
    cy.get('.whiteboard-canvas')
      .trigger('mousedown', 50, 50)
      .trigger('mousemove', 100, 100)
      .trigger('mouseup');

    // Check drawing exists
    cy.get('.whiteboard-canvas')
      .should('have.attr', 'data-empty', 'false');
  });
});
