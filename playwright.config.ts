import { defineConfig, devices } from '@playwright/test';
import { existsSync } from 'node:fs';
import { loadEnvFile } from 'node:process';

if (existsSync('.env.local')) {
  loadEnvFile('.env.local');
}
export default defineConfig({
  testDir: './tests',
  use: {
    baseURL: 'http://localhost:8065',
  },
  projects: [
    {
    name: 'setup',
    testMatch: '**/auth.setup.ts',
  },
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
      dependencies: ['setup'],
    },
  ],
});
