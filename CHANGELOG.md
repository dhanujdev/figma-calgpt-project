# Changelog

All notable changes to this project are documented in this file.

## [1.0.0] - 2026-03-12

### Added
- Vercel MCP proxy endpoint with stable ChatGPT connector path at `/mcp`.
- Vercel state proxy endpoint at `/api/state`.
- MCP resource support (`resources/list`, `resources/read`) with ChatGPT Apps widget metadata.
- Tool descriptors wired with `_meta.ui.resourceUri` and `_meta["openai/outputTemplate"]`.
- Widget bridge updates to render from `window.openai.toolOutput` and `openai:set_globals`.
- Formal release lock documentation in `RELEASE_LOCK.md`.

### Changed
- Upgraded frontend build stack lock to Vite `6.4.1`.
- Moved `react` and `react-dom` into runtime dependencies.
- Versioned widget template URI to `ui://widget/gpt-calories-v3.html` to avoid stale template cache issues.
- Aligned deployment/testing docs to Vercel MCP flow.

### Fixed
- Structured content flowing as text-only cards instead of rendering widget.
- Missing MCP `resources` capability wiring in initialize and tool metadata.
- Widget state sync behavior for repeated tool calls in ChatGPT.
- Date badge parsing edge case caused by `YYYY-MM-DD` timezone conversion behavior.
