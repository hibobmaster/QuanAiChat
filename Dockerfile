FROM node:lts-slim AS base

# Enable pnpm via corepack so every stage can run the same commands.
RUN corepack enable && corepack prepare pnpm@latest --activate

FROM base AS deps

WORKDIR /app

COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./

# Install production and development dependencies once for all subsequent stages.
ENV HUSKY=0
RUN pnpm install --frozen-lockfile

FROM base AS builder

RUN apt-get update && apt-get install -y --no-install-recommends git && rm -rf /var/lib/apt/lists/*

ENV GOOGLE_API_KEY=""
ENV DEEPSEEK_API_KEY=""
ENV CODE=""

WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .

# Build the Next.js application using pnpm.
RUN pnpm build

FROM base AS runner
WORKDIR /app

RUN apt-get update && apt-get install -y --no-install-recommends proxychains4 && rm -rf /var/lib/apt/lists/*

ENV GOOGLE_API_KEY=""
ENV DEEPSEEK_API_KEY=""
ENV CODE=""
ENV ENABLE_MCP=""

COPY --from=builder /app/public ./public
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static
COPY --from=builder /app/.next/server ./.next/server

RUN mkdir -p /app/app/mcp && chmod 777 /app/app/mcp
COPY --from=builder /app/app/mcp/mcp_config.default.json /app/app/mcp/mcp_config.json

EXPOSE 3000

CMD ["node", "server.js"]
