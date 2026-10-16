import worker from '../worker/index.js';

// Vercel's Node.js function adapter keeps the same Worker routes and security guards.
export const config = {api: {bodyParser: false}};
export default async function handler(req, res) {
  try {
    const url = new URL(req.url, 'https://' + (req.headers.host || 'localhost'));
    const route = url.searchParams.get('__reversa_path');
    if (route !== null) url.pathname = route;
    url.searchParams.delete('__reversa_path');
    const headers = new Headers();
    for (const [name, value] of Object.entries(req.headers)) {
      if (value && !['cf-connecting-ip', 'x-forwarded-for', 'x-vercel-forwarded-for'].includes(name.toLowerCase())) {
        headers.set(name, Array.isArray(value) ? value.join(',') : value);
      }
    }
    // Vercel overwrites x-vercel-forwarded-for; never trust a visitor's CF header.
    const client = req.headers['x-vercel-forwarded-for'];
    headers.set('cf-connecting-ip', typeof client === 'string' ? client.split(',')[0].trim() : req.socket?.remoteAddress || 'local');
    const chunks = [];
    let bytes = 0;
    for await (const chunk of req) {
      bytes += Buffer.byteLength(chunk);
      if (bytes > 2048) {
        res.writeHead(413, {'content-type': 'application/json', 'cache-control': 'no-store'});
        res.end(JSON.stringify({error: 'Request body exceeds 2 KB.'}));
        return;
      }
      chunks.push(Buffer.from(chunk));
    }
    const response = await worker.fetch(new Request(url, {
      method: req.method, headers,
      ...(chunks.length ? {body: Buffer.concat(chunks)} : {})
    }), process.env);
    res.writeHead(response.status, Object.fromEntries(response.headers));
    res.end(Buffer.from(await response.arrayBuffer()));
  } catch {
    res.writeHead(500, {'content-type': 'application/json', 'cache-control': 'no-store'});
    res.end(JSON.stringify({error: 'Internal server error'}));
  }
}
