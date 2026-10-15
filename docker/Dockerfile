FROM node:22-bookworm-slim AS build
RUN corepack enable && corepack prepare pnpm@12.6.0 --activate
WORKDIR /app
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
RUN pnpm install --frozen-lockfile
COPY . .
RUN pnpm build

FROM node:22-bookworm-slim
RUN corepack enable && corepack prepare pnpm@12.6.0 --activate
WORKDIR /app
COPY --from=build /app/package.json /app/pnpm-lock.yaml /app/pnpm-workspace.yaml ./
RUN pnpm install --frozen-lockfile --prod=false --ignore-scripts
COPY --from=build /app/.output ./.output
COPY wrangler.jsonc ./
COPY migrations ./migrations
COPY docker/entrypoint.sh ./docker/entrypoint.sh
RUN chmod +x docker/entrypoint.sh
ENV WRANGLER_SEND_METRICS=false
EXPOSE 8787
VOLUME ["/data"]
ENTRYPOINT ["./docker/entrypoint.sh"]
