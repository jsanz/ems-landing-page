# Staging Smoke Test

## What

Add a post-deploy smoke test step to the Buildkite pipeline that runs the
e2e suite against the live staging URL after deployment.

## Why

- Every existing and future e2e test automatically becomes a staging smoke
  test — the investment compounds with every new test case.
- Catches deployment-specific issues invisible to localhost testing:
  misconfigured CDN, missing assets, CORS, environment config errors.
- Near-zero implementation cost because `scripts/test-remote.mjs` and
  `yarn test:staging` already exist.

## Design decisions

- **Test only the deployed version, not all versions.** Each build deploys
  one branch (`master` or `vX.Y`), so testing unmodified versions is waste
  and creates false coupling (a pre-existing issue in v8.18 shouldn't block
  a master deploy).
- Uses `yarn test:staging -- --versions $BUILDKITE_BRANCH` which delegates
  URL construction to the existing `test-remote.mjs` script.
- Same `if` condition and Playwright agent image as the `deploy-staging` step.

## Known issue: CDN caching

After deploy, the CDN may still serve stale content when the smoke test runs.
Possible mitigations (not yet implemented):

1. **CDN cache invalidation in `upload.sh`** (preferred, right layer to fix
   this — deploy isn't truly "done" until new content is servable).
2. **Build fingerprint polling** — inject `BUILDKITE_COMMIT` into the page
   (e.g. `<meta>` tag), smoke test polls until it sees the expected value.
3. **Cache-bypass headers** — Playwright sets `Cache-Control: no-cache` on
   requests; depends on CDN respecting client cache directives.
4. **Simple delay** — `sleep 30` before smoke test; crude but works if
   staging CDN has short TTLs.

Recommendation: add cache invalidation to `upload.sh` as a separate PR,
then this smoke test becomes fully reliable.

## Delete this file

This file is temporary context for the PR. Remove it before merging.
