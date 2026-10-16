# Reversa MVP v0.4

Read-only Robinhood Chain transaction and contract analysis, implemented as a Cloudflare Worker with a responsive interface and viem ABI utilities.

Repository: https://github.com/carynyx80/reversa. Read [deployment instructions](DEPLOYMENT.md) and [release status](RELEASE-STATUS.md) before publishing.

The live deployment now runs in **verified mainnet replay mode**. Historical code/storage/calls and tracing passed the release gate. See RELEASE-STATUS.md and docs/verification for evidence. Receipt mode remains available as a fallback.

## Run

Install locked dependencies with `npm ci` (use a writable npm cache if required). `npm start` starts http://127.0.0.1:4173. `npm test` runs deterministic analysis, ABI, proxy and tracing tests. `npm run verify:mainnet` performs live mainnet verification and writes MAINNET-VERIFICATION.json. `npm run build` bundles the Worker; `npm run validate` validates the artifact. The build uses granular viem ESM modules and pins the package version.

## Provider configuration

Set server-side ROBINHOOD_MAINNET_RPC and ROBINHOOD_TESTNET_RPC to dedicated provider URLs. Public Robinhood endpoints are defaults. Tracing requires debug_traceTransaction with callTracer and historical coverage.

For local configuration, copy `.env.example` to `.env`, enter the dedicated endpoint, and restart the preview server. `.env` is excluded from Git. Do not put keys into browser fields or share them in chat. Node's built-in process.loadEnvFile loads this file when supported. Hosted configuration uses runtime secrets instead.

The public mainnet endpoint was verified as chain 4663 on 16 October 2026. It rejects debug_traceTransaction and trace_transaction. Therefore historical internal replay is not live with the default endpoint. A provider account is required to finish that capability; confirm Robinhood mainnet callTracer support and historical range before selecting a plan. Robinhood lists provider options at https://docs.robinhood.com/chain/connecting/.

## Implemented

Transaction / receipt / block lookup, call-trace playback, nested call tree, failure evidence, ERC-20/721-shaped Transfer logs in raw units, bytecode and PUSH4 candidates, query links and JSON export. RPC failures are surfaced without fabricating execution.

Version 0.2 adds chain-ID verification, `/api/health`, visible connection state, recent user-transaction selection (excluding Nitro system transaction types), exact native value / fee formatting, known standard static calldata candidates, standard Solidity revert decoding, evidence-based summaries, and native value movements with rollback status from traces. Native fee reporting uses receipt gasUsed multiplied by effectiveGasPrice (or transaction gasPrice fallback).

Version 0.3 adds Sourcify runtime-match source/ABI retrieval, EIP-1967 implementation/admin/beacon slot inspection, beacon implementation resolution, EIP-1167 minimal-proxy detection, arbitrary verified-ABI call/custom-error/event decoding, source file inspection, static opcode disassembly, an interactive connected call graph and parity trace fallback. ERC-20 symbol/decimals reads use the historical transaction block and remain unavailable if the provider cannot serve that state. Evidence indicators name sensitive ABI functions without claiming their permissions are audited.

On mainnet, the live token at `0xd0601ce157db5bdc3162bbac2a2c8af5320d9eec` resolved to a beacon and verified implementation with 65 ABI entries. CONTRACT-VERIFICATION.json records that check. Mock trace tests prove the decoder and hierarchy logic; they do not demonstrate live mainnet replay. Mainnet source availability depends on Sourcify coverage. Historical contract decoding requires historical code/storage/call access; the default public endpoint rejected historical state reads during testing. The app does not substitute current implementations for past ones.

## Remaining MVP work

Historical mainnet replay and ABI resolution are now enabled through the dedicated provider and passed the live scenario gate. Version 0.4 adds request/response bounds, rate and concurrency limits, analysis caching/coalescing, optional shared KV/platform rate-limiter bindings, secret redaction, security headers, metrics protection and deterministic scenario/load tests. GitHub CI checks the build; manual deployment requires a passing live provider gate. Distributed production load tests, background jobs and saved sessions remain; hosted replay and browser controls were verified. AI, security auditing, decompilation and opcode execution snapshots are not implemented. No PostgreSQL or Redis service is provisioned. These are not represented as completed features.

Tests use synthetic fixtures for reproducibility; they are never displayed as live data in the application. Calls are replayed in depth-first order, capped at 5,000, not opcode or event chronology. State differences are unavailable. This is an independent project, not an official Robinhood product.

## Vercel hosting

See [VERCEL.md](VERCEL.md) for importing this repository, adding the server-side RPC environment variable, and checking the deployed app.
