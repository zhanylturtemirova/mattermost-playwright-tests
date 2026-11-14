import { defineConfig, devices } from '@playwright/test';
import { existsSync } from 'node:fs';
import { loadEnvFile } from 'node:process';
import { baseURL } from './test-env';

if (existsSync('.env.local')) {
  loadEnvFile('.env.local');
}
export default defineConfig({
  testDir: './tests',
  use: {
    baseURL: baseURL,
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
