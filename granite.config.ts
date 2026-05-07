import { defineConfig } from '@apps-in-toss/web-framework/config';

export default defineConfig({
  appName: 'my-severance-pay',
  brand: {
    displayName: '내 퇴직금은 얼마?',
    primaryColor: '#3182F6',
    icon: 'https://static.toss.im/appsintoss/33837/cead943b-2d73-4794-b3dd-8c581420e9c2.png',
  },
  web: {
    host: 'localhost',
    port: 5173,
    commands: {
      dev: 'vite',
      build: 'tsc -b && vite build',
    },
  },
  permissions: [],
  outdir: 'dist',
});
