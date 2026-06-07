FROM nginx:1.28.0-alpine

WORKDIR /usr/share/nginx/html
COPY ./dist/apps/quality-flow-ng-app/browser /usr/share/nginx/html/quality-flow-ng-app

COPY ./docker/build/proxy-params.conf /etc/nginx/snippets/proxy-params.conf
COPY ./docker/build/nginx.conf.template.prod /etc/nginx/templates/default.conf.template

EXPOSE 80
