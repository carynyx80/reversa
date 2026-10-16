import {mkdir, writeFile} from 'node:fs/promises';
await mkdir('public', {recursive: true});
await writeFile('public/robots.txt', 'User-agent: *\nAllow: /\nDisallow: /api/\n');
console.log('Vercel routes prepared; api/index.js serves the UI and API.');
