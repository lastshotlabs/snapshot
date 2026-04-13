---
title: Capabilities
description: Generated overview of major Snapshot capabilities backed by current source.
draft: false
---

This page is generated from current source presence checks. It exists to keep the top-level docs honest about what Snapshot can do on `main`.

| Capability | Status | Evidence |
|---|---|---|
| SDK bootstrap and auth | present | `src/index.ts`, `src/create-snapshot.tsx`, `src/auth/hooks.ts` |
| Auth screens, MFA, passkeys, and OAuth | present | `src/auth/oauth-hooks.ts`, `src/auth/mfa-hooks.ts`, `src/ui/presets/auth-page.ts`, `src/ui/components/primitives/passkey-button/index.ts`, `src/ui/components/primitives/oauth-buttons/index.ts` |
| Manifest-driven UI | present | `src/ui.ts`, `src/ui/manifest/schema.ts`, `src/ui/manifest/app.tsx` |
| Manifest routing, layouts, navigation, and guards | present | `src/ui/manifest/router.ts`, `src/ui/layouts/registry.tsx`, `src/ui/manifest/guard-registry.ts`, `src/ui/components/layout/nav/index.ts`, `src/ui/components/layout/nav-user-menu/index.ts` |
| Actions, overlays, state, and workflows | present | `src/ui/actions/executor.ts`, `src/ui/actions/confirm.tsx`, `src/ui/actions/toast.tsx`, `src/ui/state/hooks.ts`, `src/ui/workflows/engine.ts` |
| Tokenized theming, slots, and stateful styling | present | `src/ui/tokens/resolve.ts`, `src/ui/tokens/schema.ts`, `src/ui/components/_base/schema.ts`, `src/ui/components/_base/style-surfaces.ts` |
| SSR and manifest rendering | present | `src/ssr/index.ts`, `src/ssr/manifest-renderer.ts`, `src/ssr/render.ts` |
| React Server Components support | present | `src/ssr/rsc.ts`, `src/vite/rsc-transform.ts` |
| Vite app and sync plugins | present | `src/vite/index.ts` |
| CLI scaffold and sync | present | `src/cli/commands/init.ts`, `src/cli/commands/sync.ts`, `src/cli/commands/manifest/init.ts` |
| Community and notification APIs | present | `src/community/index.ts`, `src/webhooks/index.ts` |
| Realtime: websocket and SSE | present | `src/ws/manager.ts`, `src/sse/manager.ts`, `src/push/hook.ts` |
| Data, forms, navigation, and overlay components | present | `src/ui/components/data/data-table/index.ts`, `src/ui/components/forms/auto-form/index.ts`, `src/ui/components/navigation/tree-view/index.ts`, `src/ui/components/overlay/command-palette/index.ts` |
| Content and media components | present | `src/ui/components/content/markdown/index.ts`, `src/ui/components/content/rich-input/index.ts`, `src/ui/components/content/rich-text-editor/index.ts`, `src/ui/components/content/file-uploader/index.ts`, `src/ui/components/media/image/index.ts`, `src/ui/components/media/embed/index.ts`, `src/ui/components/content/link-embed/index.ts` |
| Communication components | present | `src/ui/components/communication/chat-window/index.ts`, `src/ui/components/communication/comment-section/index.ts`, `src/ui/components/communication/message-thread/index.ts`, `src/ui/components/communication/emoji-picker/index.ts`, `src/ui/components/communication/gif-picker/index.ts`, `src/ui/components/communication/presence-indicator/index.ts` |
| Workflow, commerce, and operational surfaces | present | `src/ui/components/workflow/kanban/index.ts`, `src/ui/components/workflow/calendar/index.ts`, `src/ui/presets/index.ts`, `src/ui/components/workflow/notification-feed/index.ts`, `src/ui/components/commerce/pricing-table/index.ts`, `src/ui/components/data/chart/index.ts`, `src/ui/components/data/feed/index.ts`, `src/ui/components/forms/wizard/index.ts` |
| Preset-driven page assembly | present | `src/ui/presets/crud-page.ts`, `src/ui/presets/dashboard-page.ts`, `src/ui/presets/settings-page.ts`, `src/ui/presets/auth-page.ts` |
| Visual component showcase and canonical examples | present | `playground/src/showcase.tsx`, `playground/src/app.tsx`, `playground/src/token-editor.tsx` |
| Testing infrastructure and contract suites | present | `src/test-setup.ts`, `src/create-snapshot.test.tsx`, `src/ui/manifest/__tests__/schema.test.ts`, `src/ssr/__tests__/render.test.tsx`, `src/vite/__tests__/plugin.test.ts`, `src/cli/__tests__/manifest-validate.test.ts` |
