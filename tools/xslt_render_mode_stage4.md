# EpiDoc Render Mode (Stage 4)

Stage 4 introduces a feature flag / mode resolver for EpiDoc rendering. The goal is to make later rollout safe and reversible before wiring the renderer into controllers.

## Env variable

- `EPIDOC_RENDER_MODE`

Allowed values:

- `legacy_js` — use existing browser-side XML renderer
- `xslt_mvp` — prefer server-side XSLT renderer (MVP path)
- `hybrid` — mixed mode (XSLT for migrated parts, legacy UI/client logic for the rest)

Default (current stage):

- `legacy_js`

## Resolver behavior

Implemented in `App\Services\Epidoc\Xslt\EpidocRenderModeResolver`.

It provides:

- normalized configured mode;
- validation with fallback to `legacy_js` for unknown values;
- policy helpers:
  - whether XSLT should be attempted;
  - whether legacy JS is default path;
  - whether fallback to legacy is allowed on XSLT failure (always `true` in stage 4 for safety);
  - whether hybrid composition is intended.

## Why stage 4 exists before controller integration

This separates rollout policy from rendering logic. In stage 5 the controller can simply ask the resolver what to do instead of hardcoding feature-flag logic.

