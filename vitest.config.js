import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    testTimeout: 20000,
    exclude : [
      "./src/index.js",
      "node_modules",
      "coverage"
    ]
  },
  
});