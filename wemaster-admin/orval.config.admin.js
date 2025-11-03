import { defineConfig } from 'orval';

export default defineConfig({
  'wemaster-admin-api': {
    input: {
      // Using the full OpenAPI spec generated from NestJS
      target: '../wemaster-nest/openapi-generated.json',
    },
    output: {
      mode: 'tags-split', // Split by tags to organize endpoints by modules
      target: 'src/api/endpoints', // Output directory for endpoint files
      schemas: 'src/api/models', // Output directory for model definitions
      client: 'axios', // Use axios for HTTP requests
      mock: false, // Don't generate mock functions
      prettier: true, // Format with Prettier
      baseUrl: '/api/v1', // Base URL for all requests
      override: {
        mutator: {
          path: 'src/api/mutator.js', // Use the existing mutator
          name: 'instance',
        },
        // Add decorators for additional functionality
        operations: {
          // Customize specific operations if needed
        },
        // Ensure proper error handling
        errorHandler: {
          enabled: true,
        },
      },
    },
    hooks: {
      afterAllFileWrite: 'prettier --write',
    },
  },
});