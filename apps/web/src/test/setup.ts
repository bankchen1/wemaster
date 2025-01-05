import '@testing-library/jest-dom';
import { server } from './mocks/server';

beforeAll(() => {
  // Enable API mocking
  server.listen();
});

afterEach(() => {
  // Reset handlers between tests
  server.resetHandlers();
});

afterAll(() => {
  // Clean up
  server.close();
});
