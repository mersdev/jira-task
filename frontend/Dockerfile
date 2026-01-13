FROM node:22-alpine AS builder

WORKDIR /app

COPY package*.json ./
RUN npm ci

COPY . .
RUN npm run build

FROM nginx:alpine

COPY --from=builder /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf.template

EXPOSE 8080

CMD sh -c ': "${PORT:=8080}"; : "${BACKEND_URL:=http://localhost:3000}"; envsubst < /etc/nginx/conf.d/default.conf.template > /etc/nginx/conf.d/default.conf && nginx -g "daemon off;"'
