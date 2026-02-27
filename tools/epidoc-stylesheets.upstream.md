# EpiDoc Stylesheets Upstream (Stage 1)

This project uses the official EpiDoc Reference Stylesheets as a Git submodule for the XSLT migration plan (`xslt_plan.md`, stage 1).

## Source

- Repository: `https://github.com/EpiDoc/Stylesheets.git`
- Type: git submodule
- Local path: `tools/epidoc-stylesheets`

## Pinned revision (initial integration)

- Commit: `398633bf06dc3bba89cc35f3d3550033076b421c`

## Notes

- Runtime integration (Saxon-HE / server-side rendering) is implemented in later stages.
- At this stage we only pin the upstream source in the repository and add basic presence tests.

