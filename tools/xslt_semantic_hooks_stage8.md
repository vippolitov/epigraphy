# XSLT Semantic Hooks (Stage 8)

Stage 8 adds a post-processing step for server-rendered EpiDoc edition HTML. The goal is to provide stable semantic hooks for:

- Zaliznyak display rules (client-side overlay)
- future interactive reading constructor (`app/lem/rdg`)

## Approach

After XSLT output is normalized, `EpidocXsltRenderer` passes the edition HTML through:

- `App\Services\Epidoc\Xslt\EpidocEditionHtmlPostProcessor`

The post-processor does **not** reinterpret TEI/XML. It only enriches already-rendered HTML with stable attributes when recognizable structures/classes are present.

## Hook examples

- edition root:
  - `data-epidoc-role="edition-root"`
  - `data-epidoc-hook="edition-root"`
- variant apparatus node (`app` / `.epidoc-app`):
  - `data-epidoc-role="app"`
  - `data-epidoc-hook="variant-app"`
  - `data-app-id="app-N"` (generated if missing)
- readings (`lem`, `rdg`):
  - `data-epidoc-role="reading"`
  - `data-reading-kind="lem"` / `data-reading-kind="rdg"`
- semantic markers:
  - `supplied`, `unclear`, `gap` => `data-epidoc-hook="..."`

## Why post-processing (instead of custom XSLT now)

- Keeps stage 8 small and reversible
- Avoids coupling to a specific EpiDoc stylesheet template set too early
- Lets the frontend start relying on stable hooks before deeper XSLT overrides (later stages)

