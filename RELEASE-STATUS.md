# Verified mainnet replay release

Updated 16 October 2026. Live app: https://reversa.ojerindeayomide3.workers.dev

## Passed

- Live health: Robinhood mainnet, chain ID 4663, dedicated provider, full replay mode.
- Historical contract code, storage, eth_call and callTracer access.
- Five scenario categories across two real mainnet transactions: successful, reverted, nested calls, proxy resolution and token transfer. The successful transaction returned 10 call frames with maximum depth 4; the failed transaction returned 2 calls and decoded revert reason SPL.
- Hosted browser controls: next/previous, automatic playback, 10-node execution graph, node inspection, ABI argument decoding and JSON export.
- Historical token metadata and transfer amount decoding; current-state verified source/ABI and beacon/implementation resolution.
- Deterministic regression tests, request/security bounds, cache/concurrency tests, 100-request fixture load test, build validation and GitHub CI.

Evidence is under `docs/verification/`. `verification-cases.json` contains the public case hashes used by the full-mode release gate. Secrets remain in GitHub/Cloudflare, not in this repository.

## Limits

This is a verified MVP, not an exhaustive security audit or an unlimited-load guarantee. Provider rate limits are possible; verification uses paced requests and bounded retries. State differences, opcode stack/memory snapshots, AI explanations, decompilation, saved workspaces and API billing are outside this MVP. Browser QA covered the in-app Chromium browser; Safari/Firefox behavior has not been independently verified.

The default deployment mode is now full. Receipt mode remains available as a fallback when archive/tracing access is unavailable.
