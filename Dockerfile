# syntax=docker/dockerfile:1
ARG NODE_VERSION=26.8.2
ARG ALPINE_VERSION=3.24
ARG NGINX_VERSION=1.31.6

FROM node:${NODE_VERSION}-alpine${ALPINE_VERSION} AS build
WORKDIR /app
COPY package.json package-lock.json .npmrc ./
RUN npm ci
COPY . .
ARG VITE_LOG_JWT
ARG VITE_ITEM_TITLE_MAX
ARG VITE_ITEM_DESCRIPTION_MAX
# Sin estos valores el build no debe pasar (se "hornean" en el JS).
RUN test -n "$VITE_LOG_JWT" && test -n "$VITE_ITEM_TITLE_MAX" && test -n "$VITE_ITEM_DESCRIPTION_MAX" \
 && npm run build

FROM nginxinc/nginx-unprivileged:${NGINX_VERSION}-alpine
USER 0
RUN rm -f /etc/nginx/conf.d/default.conf
COPY deploy/nginx.conf /etc/nginx/nginx.conf
COPY deploy/security-headers.conf /etc/nginx/snippets/security-headers.conf
COPY deploy/default.conf.template /etc/nginx/templates/default.conf.template
COPY --from=build /app/dist /usr/share/nginx/html
# El entrypoint escribe los server blocks generados en /tmp (el filesystem es de solo lectura).
ENV NGINX_ENVSUBST_OUTPUT_DIR=/tmp
USER 101:101
HEALTHCHECK --interval=10s --timeout=3s --start-period=5s --start-interval=1s \
  CMD ["sh", "-c", "wget -q -O /dev/null \"http://127.0.0.1:${NGINX_PORT}/healthz\""]
