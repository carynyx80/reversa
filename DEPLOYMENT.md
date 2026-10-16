# GitHub and deployment

GitHub repository: https://github.com/carynyx80/reversa

GitHub stores the code and runs checks. The backend deploys to Cloudflare Workers; GitHub Pages cannot execute its server-side API or protect provider credentials.

## Local run

Use Node 22 or later. Run `npm ci`, `npm test`, `npm run build`, `npm run validate`, then `npm start`. To test the compiled artifact, run `npm run start:production`. `PORT` and `HOST` configure the local Node adapter; its default is loopback only.

## Required account setup

1. Obtain a Robinhood Chain mainnet endpoint with chain ID 4663, historical code/storage/eth_call access, and either `debug_traceTransaction` with `callTracer` or `trace_transaction`. Confirm historical coverage, throughput and charges with the provider before subscribing. Official provider list: https://docs.robinhood.com/chain/connecting/.
2. Put the endpoint in local `.env` as `ROBINHOOD_MAINNET_RPC`. Never commit `.env` or put the endpoint in browser fields.
3. Copy `verification-cases.example.json` to `verification-cases.json`. Replace every placeholder with a real mainnet transaction matching its category. Hashes are public and may be committed. Categories may reuse a transaction only when it meets both tests.
4. Run `npm run verify:provider`. It must return `ready: true`. It checks the network, real receipts, both supported trace formats, historical code/storage, nested calls, a reverted transaction, a historical proxy implementation and a token event. It does not infer unavailable data.
5. Configure a Cloudflare account and a scoped Workers deployment API token. Add these secrets to the GitHub repository's `production` environment: `CLOUDFLARE_API_TOKEN`, `CLOUDFLARE_ACCOUNT_ID`, and `ROBINHOOD_MAINNET_RPC`.
6. In GitHub Actions, run **Deploy Reversa** manually. It runs tests/build validation and the live provider gate before deployment. The RPC secret is installed server-side by Wrangler. Review the emitted Worker URL, then verify `/api/health`, real transaction replay, token flow, Contract Lab, export and error handling on that URL.

The default `workers_dev` URL is public when deployed. The workflow is manual and is not triggered by ordinary pushes. Cloudflare account configuration and runtime secrets are not created by committing this repository. The workflow was prepared; hosted deployment has not yet been verified.

## Operational controls

- API requests have streamed 2 KB body limits; upstream JSON responses are bounded to 8 MB and source responses to 768 KB.
- Default limit: 30 API calls/minute/client per Worker isolate, 4 concurrent distinct analyses, and coalescing of identical in-flight analyses. The Node adapter ignores spoofed forwarding headers and uses the socket IP.
- Bounded local analysis cache: 8 MB, maximum 1 MB/entry, 30-second TTL. Optional `ANALYSIS_CACHE` KV binding enables a shared 60-second cache. Pending transactions are not cached. Cached unfinalized results may be up to 60 seconds old and must be rechecked before drawing finality conclusions.
- Optional `RATE_LIMITER` platform binding enables Cloudflare-managed rate limiting. Configure this and edge/WAF limits before a broad public launch. The in-memory fallback is not a global distributed quota.
- Optional `METRICS_TOKEN` enables authenticated `/api/metrics` counters. No RPC URLs, input bodies or credentials are logged by application code. Cloudflare observability is enabled in the hosting configuration; review platform access/log retention settings in your account.
- CSP restricts executable scripts to the app's hash, framing is denied, browser permissions are restricted, and API requests from other origins are rejected.
- No automated test suite is an independent security audit or a distributed provider-load benchmark. Request-volume limits should also be set at the provider account.

## Release gates

| Gate | Evidence |
| --- | --- |
| Deterministic tests | `npm test` / GitHub **Reversa checks** |
| Worker artifact | `npm run build && npm run validate && npm run deploy:check` |
| Mainnet receipts and source | `npm run verify:mainnet`, recorded reports |
| Real archive and trace matrix | `npm run verify:provider`, `ready: true` required |
| Hosted app | Verify the returned production URL after deployment |

Do not describe the release as full historical replay until the live provider and hosted checks pass. AI explanations, decompilation, opcode execution snapshots, saved workspaces and API billing remain outside this MVP.
