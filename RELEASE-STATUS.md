# Release status

Updated 16 October 2026.

## Implemented and checked locally

- Mainnet chain verification, live transaction/receipt lookup and current-state verified source retrieval.
- Call replay, connected graph, rollback-aware native movement, token events, ABI decoding, source/proxy/beacon inspection and static disassembly.
- Method/origin/type validation, streaming input bounds, upstream response bounds, credential redaction, hash-based script CSP, rate/admission limits, bounded cache/coalescing and optional KV/rate-limiter bindings.
- Deterministic successful/reverted/nested/proxy/token scenarios and 100 concurrent fixture analyses coalesced to 5 RPC requests. This is not a distributed live-provider load test.
- GitHub CI and a manual Cloudflare deployment workflow with a required live provider gate.

## Required before production release

1. Add a Robinhood mainnet archive/tracing endpoint. None has been supplied. The public RPC rejected tracing and historical state during tests.
2. Add real verification-case hashes and pass `npm run verify:provider` for success, revert, nested, proxy and token cases.
3. Add Cloudflare deployment credentials and the endpoint as repository environment secrets.
4. Run deployment, confirm the hosted URL, and repeat browser checks there.

The local Windows sandbox prevents Wrangler's internal directory scanning during dry-run; the compiled Worker validates locally. GitHub CI also runs the dry-run in its Linux runner, and its result must be checked rather than assumed.

The full live replay and hosted-release gates are **not passed**. An independent security audit and a distributed traffic benchmark have not been performed. No claim of perfect behavior is made.
