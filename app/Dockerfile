# Erik Heerke Witteveen | Student 413560
# DevSecOps Pipeline | Hanze University of Applied Sciences
# Assessor: Dr Mohsen Kakavand (KAMO)
#
# Multi-stage build. Stage 1 compiles the TypeScript, stage 2 runs the app.
# This keeps the production image small and free of dev tools and source files.

# Stage 1: build
# Full Node environment, installs everything and compiles TypeScript to JavaScript
FROM node:20-alpine AS builder

WORKDIR /app

# Copy package files first so this layer gets cached when only source files change
COPY package*.json ./
RUN npm install

COPY tsconfig.json ./
COPY src/ ./src/
RUN npm run build

# Stage 2: production image
# Fresh Alpine base, only copies what is needed to run the app
FROM node:20-alpine AS production

WORKDIR /app
ENV NODE_ENV=production

# Only install production dependencies, dev tools stay out of the final image
COPY package*.json ./
RUN npm install --omit=dev && npm cache clean --force

# Pull the compiled output from the builder stage
COPY --from=builder /app/dist ./dist
COPY public/ ./public/

EXPOSE 3000

# Docker polls this every 30 seconds to check the app is still running
HEALTHCHECK --interval=30s --timeout=5s --start-period=15s \
  CMD wget -qO- http://localhost:3000/health || exit 1

# Run as non-root so the app does not have root access inside the container
USER node

CMD ["node", "dist/index.js"]
