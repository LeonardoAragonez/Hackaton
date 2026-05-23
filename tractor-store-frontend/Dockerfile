# syntax=docker/dockerfile:1
FROM node:22-alpine AS build
WORKDIR /app
RUN corepack enable && corepack prepare pnpm@9.15.0 --activate
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml nx.json tsconfig.base.json ./
COPY apps ./apps
COPY packages ./packages
COPY tools ./tools
COPY tailwind.config.js postcss.config.js jest.preset.js ./
RUN pnpm install --frozen-lockfile || pnpm install
RUN pnpm exec msw init apps/shell/public --save
ENV NX_DAEMON=false
ENV NODE_ENV=production
RUN pnpm build

FROM nginx:1.27-alpine
COPY docker/nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=build /app/dist/apps/shell /usr/share/nginx/html
COPY --from=build /app/dist/packages/mfe-explore /usr/share/nginx/html/mfe-explore
COPY --from=build /app/dist/packages/mfe-decide /usr/share/nginx/html/mfe-decide
COPY --from=build /app/dist/packages/mfe-checkout /usr/share/nginx/html/mfe-checkout
EXPOSE 80
