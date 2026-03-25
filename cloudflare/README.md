# Deploying prompts.chat to Cloudflare Containers

This guide covers deploying the Next.js application to [Cloudflare Containers](https://developers.cloudflare.com/containers/).

## Prerequisites

- [Docker](https://docs.docker.com/desktop/) running locally
- [Wrangler CLI](https://developers.cloudflare.com/workers/wrangler/install-and-update/) (`npm i -g wrangler`)
- A Cloudflare account on the [Workers Paid plan](https://workers.cloudflare.com/pricing/)
- An external PostgreSQL database (e.g. Neon, Supabase, or self-hosted)

## Setup

### 1. Install dependencies

```bash
npm install @cloudflare/containers
```

### 2. Configure secrets

Set required environment variables as Wrangler secrets. These are injected into the container at runtime:

```bash
# Required
wrangler secret put DATABASE_URL
wrangler secret put AUTH_SECRET

# OAuth (if using these providers)
wrangler secret put AUTH_GITHUB_ID
wrangler secret put AUTH_GITHUB_SECRET
wrangler secret put AUTH_GOOGLE_ID
wrangler secret put AUTH_GOOGLE_SECRET

# Optional
wrangler secret put OPENAI_API_KEY
wrangler secret put SENTRY_DSN
```

### 3. Deploy

```bash
npx wrangler deploy
```

On the first deploy, Wrangler will:
1. Build the Docker image locally using `Dockerfile.cloudflare`
2. Push the image to Cloudflare's managed registry
3. Deploy the Worker that routes traffic to the container

The first deploy takes a few minutes for image push and container provisioning. Subsequent deploys are faster due to layer caching.

### 4. Check status

```bash
npx wrangler containers list
```

## Architecture

```
User Request → Cloudflare Network → Worker (router) → Container (Next.js on Node.js)
                                                          ↓
                                                    PostgreSQL DB
```

- **Worker** (`cloudflare/worker.js`): Thin routing layer that forwards all requests to the container
- **Container** (`Dockerfile.cloudflare`): Multi-stage Node.js image running the Next.js standalone server
- The container runs the full Node.js runtime, so all dependencies (Prisma, next-auth, next-intl, sharp) work without modification

## Configuration

Key settings in `wrangler.jsonc`:

| Setting | Default | Description |
|---------|---------|-------------|
| `max_instances` | 3 | Maximum concurrent container instances |
| `instance_type` | standard-1 | 2 vCPU, 2 GiB memory |
| `sleepAfter` | 5m | Container sleeps after 5 minutes of inactivity |

Adjust `max_instances` and `instance_type` based on your traffic. See [instance types](https://developers.cloudflare.com/containers/platform-details/#instance-types) for all options.

## Local development

Local development remains unchanged:

```bash
npm run dev
```

To test the Docker image locally:

```bash
docker build -f Dockerfile.cloudflare -t prompts-chat .
docker run -p 3000:3000 --env-file .env prompts-chat
```

## Notes

- **Cold starts**: Containers take 2-3 seconds to wake from sleep. The `sleepAfter` setting in `cloudflare/worker.js` controls when idle containers go to sleep.
- **Database**: Use an external PostgreSQL provider. Cloudflare Hyperdrive can be added for edge connection pooling if needed.
- **Containers Beta**: Cloudflare Containers is currently in beta. See [beta info](https://developers.cloudflare.com/containers/beta-info/) for limitations.
