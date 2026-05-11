---
title: Docker
summary: Docker Compose quickstart
---

Run Jasmin.ia in Docker without installing Node or pnpm locally.

## Compose Quickstart (Recommended)

```sh
docker compose -f docker/docker-compose.quickstart.yml up --build
```

Open [http://localhost:3100](http://localhost:3100).

Defaults:

- Host port: `3100`
- Data directory: `./data/docker-jasminia`

Override with environment variables:

```sh
JASMINIA_PORT=3200 JASMINIA_DATA_DIR=../data/pc \
  docker compose -f docker/docker-compose.quickstart.yml up --build
```

**Note:** `JASMINIA_DATA_DIR` is resolved relative to the compose file (`docker/`), so `../data/pc` maps to `data/pc` in the project root.

## Manual Docker Build

```sh
docker build -t jasminia-local .
docker run --name jasminia \
  -p 3100:3100 \
  -e HOST=0.0.0.0 \
  -e JASMINIA_HOME=/jasminia \
  -v "$(pwd)/data/docker-jasminia:/jasminia" \
  jasminia-local
```

## Data Persistence

All data is persisted under the bind mount (`./data/docker-jasminia`):

- Embedded PostgreSQL data
- Uploaded assets
- Local secrets key
- Agent workspace data

## Claude and Codex Adapters in Docker

The Docker image pre-installs:

- `claude` (Anthropic Claude Code CLI)
- `codex` (OpenAI Codex CLI)

Pass API keys to enable local adapter runs inside the container:

```sh
docker run --name jasminia \
  -p 3100:3100 \
  -e HOST=0.0.0.0 \
  -e JASMINIA_HOME=/jasminia \
  -e OPENAI_API_KEY=sk-... \
  -e ANTHROPIC_API_KEY=sk-... \
  -v "$(pwd)/data/docker-jasminia:/jasminia" \
  jasminia-local
```

Without API keys, the app runs normally — adapter environment checks will surface missing prerequisites.
