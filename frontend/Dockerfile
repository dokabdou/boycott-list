FROM node:22-alpine AS build
WORKDIR /app

# Increase memory for the Angular build
ENV NODE_OPTIONS="--max-old-space-size=8192"

COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

# Stage 2: Run the Angular SSR server
FROM node:22-alpine
WORKDIR /app
COPY --from=build /app/dist ./dist

ENV HOST=0.0.0.0
ENV PORT=4200
ENV NODE_OPTIONS="--max-old-space-size=4096"

EXPOSE 4200

ENTRYPOINT ["node", "--max-old-space-size=4096", "dist/frontend/server/server.mjs"]