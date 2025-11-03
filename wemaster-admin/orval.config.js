import { defineConfig } from 'orval';

export default defineConfig({
  'wemaster-api': {
    input: {
      target: '../wemaster-nest/tmp/openapi-runtime.json',
    },
    output: {
      mode: 'tags-split',
      target: 'src/api/endpoints',
      schemas: 'src/api/models',
      client: 'axios',
      mock: false,
      prettier: true,
      override: {
        mutator: {
          path: 'src/api/mutator.js',
          name: 'instance',
        },
      },
    },
  },
});