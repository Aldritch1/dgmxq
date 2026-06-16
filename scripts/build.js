import { access } from 'node:fs/promises';

await Promise.all([
  access('functions/[[default]].js'),
  access('public/style.css'),
]);

console.log('EdgeOne Pages build artifacts are ready.');
