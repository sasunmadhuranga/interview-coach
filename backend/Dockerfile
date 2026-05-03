# ---------- BUILD STAGE ----------
FROM node:22-alpine AS builder

WORKDIR /app

COPY package*.json ./
RUN npm ci

COPY . .

RUN npm run build


# ---------- RUNTIME STAGE ----------
FROM node:22-alpine AS runner

WORKDIR /app

ENV NODE_ENV=production

# only install production deps
COPY package*.json ./
RUN npm ci --omit=dev

# only compiled output (NOT full source)
COPY --from=builder /app/dist ./dist

EXPOSE 5000

CMD ["node", "dist/server.js"]