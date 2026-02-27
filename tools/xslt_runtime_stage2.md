# XSLT Runtime Preparation (Stage 2)

This document captures the runtime decisions and configuration introduced in stage 2 of `xslt_plan.md`.

## Goal

Prepare the Symfony application to run EpiDoc XSLT transforms later (stage 3+) using a local Saxon-HE runtime, without yet wiring XSLT execution into controllers.

## Runtime decision

- XSLT transforms will run on the same application server as Symfony/PHP.
- No separate XSLT server/service is required at this stage.
- The planned execution engine is `Saxon-HE` (Java CLI).

## Symfony runtime config (env variables)

Added variables:

- `EPIDOC_XSLT_JAVA_BIN` — Java executable (default: `java`)
- `EPIDOC_XSLT_SAXON_JAR` — path to Saxon-HE jar (project-relative or absolute)
- `EPIDOC_XSLT_STYLESHEETS_DIR` — path to EpiDoc stylesheets directory
- `EPIDOC_XSLT_TIMEOUT_SECONDS` — timeout for transform execution (seconds)

Configured in:

- `.env`
- `.env.test`
- `config/services.yaml` (service wiring for `SaxonRuntimeConfig`)

## Added PHP runtime helpers

- `App\Services\Epidoc\Xslt\SaxonRuntimeConfig`
  - normalizes runtime paths (absolute / project-relative)
  - validates timeout and required path values
- `App\Services\Epidoc\Xslt\SaxonCommandBuilder`
  - builds a deterministic Saxon CLI command array
  - resolves stylesheet path against configured stylesheets dir

These helpers do not execute external processes yet. Actual XSLT invocation is stage 3.

## Operational notes (for later stage 3)

- The Saxon jar file is not bundled yet. It is expected at `EPIDOC_XSLT_SAXON_JAR`.
- If the jar or Java runtime is missing, stage 3 renderer should:
  - log an error/warning,
  - fail gracefully,
  - allow fallback to legacy client-side rendering.

## Minimal checks added in tests

Stage 2 tests verify:

- config normalizes project-relative paths to absolute paths;
- command builder composes the expected Saxon CLI arguments;
- invalid timeout is rejected early.

