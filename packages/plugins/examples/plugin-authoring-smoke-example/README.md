# Plugin Authoring Smoke Example

A Jasmin.ia plugin

## Development

```bash
pnpm install
pnpm dev            # watch builds
pnpm dev:ui         # local dev server with hot-reload events
pnpm test
```

## Install Into Jasmin.ia

```bash
pnpm jasminia plugin install ./
```

## Build Options

- `pnpm build` uses esbuild presets from `@jasminia/plugin-sdk/bundlers`.
- `pnpm build:rollup` uses rollup presets from the same SDK.
