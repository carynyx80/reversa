# Deploy Reversa on Vercel

1. In Vercel, choose **Add New → Project**, then import **carynyx80/reversa**.
2. Use the repository root (`./`) and framework **Other**. The committed `vercel.json` sets the build command, output directory and function duration. Use Node.js **22.x** in Project Settings.
3. Before deploying, add these environment variables for **Production** (and Preview if you want working previews):

| Name | Value |
| --- | --- |
| `ROBINHOOD_MAINNET_RPC` | Your dedicated Robinhood mainnet RPC URL with historical reads and `debug_traceTransaction` / `callTracer` enabled |
| `DEPLOYMENT_MODE` | `full` |

GitHub environment secrets are not copied to Vercel. Enter the RPC URL directly in Vercel's environment variable form; never commit it or prefix it with `NEXT_PUBLIC_`. Cloudflare credentials are not needed on Vercel. Optional: `ROBINHOOD_TESTNET_RPC` and `METRICS_TOKEN`.

4. Click **Deploy**. If you add or change variables after a deployment, redeploy to apply them.
5. Open `/api/health?network=mainnet` on your new Vercel domain. Expect chain ID `4663`, provider `Dedicated endpoint` and deployment mode `full`.
6. Analyze `0x2671d3f54c9bf09205e9e102bab3a5791d052c5bfc082e50621dad420f22f7b0`. The existing mainnet verification returned 10 call frames. Test the execution graph, playback and JSON export on your Vercel domain too.

The Node function serves both the UI and API with the existing origin checks, body limit and server-side RPC handling. Requests have a 60-second function budget. In-memory caching and rate limits are per function instance, not global across Vercel instances; configure platform-level protection before scaling traffic. Large responses must also fit Vercel's function response size limits. The existing Cloudflare deployment remains available.

Run `npm test` and `npm run build:vercel` locally. Vercel deployment itself must be checked after import; local adapter tests do not prove a hosted Vercel deployment.
