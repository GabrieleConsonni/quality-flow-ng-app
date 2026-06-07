FROM aknregistry.azurecr.io/node-chrome:24.12.0-slim AS builder

ARG DEVEXTREME_KEY
ENV DEVEXTREME_KEY=${DEVEXTREME_KEY} \
    HUSKY=0

WORKDIR /app

COPY . .

RUN pnpm i

RUN pnpm run styles-build:production

FROM nginx:1.28.0-alpine

WORKDIR /usr/share/nginx/html
COPY --from=builder /app/dist/apps/quality-flow-ng-app/browser /usr/share/nginx/html/quality-flow-ng-app

COPY ./docker/build/proxy-params.conf /etc/nginx/snippets/proxy-params.conf
COPY ./docker/build/nginx.conf.template.prod /etc/nginx/templates/default.conf.template

EXPOSE 80
