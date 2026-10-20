# built stage (context: repo root)
FROM oven/bun:1.4.3 AS build-stage
WORKDIR /app
COPY package.json bun.lock ./
RUN bun install --frozen-lockfile
COPY frontend frontend
RUN bun run build

# production stage
FROM nginx:stable-alpine AS production-stage
RUN rm /etc/nginx/conf.d/default.conf
COPY frontend/nginx/nginx.conf /etc/nginx/conf.d
COPY --from=build-stage /app/frontend/dist /usr/share/nginx/html
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
