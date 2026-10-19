# Cassino Battlefields: static Astro site served by nginx.
FROM node:22-alpine AS build
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci --no-audit --no-fund
COPY . .
ARG SITE_URL=https://www.cassinobattlefields.co.uk
ARG PUBLIC_NOINDEX=0
ENV SITE_URL=$SITE_URL PUBLIC_NOINDEX=$PUBLIC_NOINDEX
RUN npm run build

FROM nginx:1.27-alpine
COPY deploy/nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=build /app/dist /usr/share/nginx/html
EXPOSE 8080
HEALTHCHECK --interval=30s --timeout=3s CMD wget -qO- http://127.0.0.1:8080/healthz || exit 1
