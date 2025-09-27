# Stage 1: build
FROM node:20-alpine AS builder

# Set working directory
WORKDIR /app

# Install pnpm
RUN npm install -g pnpm

# Copy package.json and pnpm-lock.yaml
COPY ../../package.json ../../pnpm-lock.yaml ./
COPY ../../pnpm-workspace.yaml ./

# Copy backend service code
COPY ./ ./ 

# Install dependencies
RUN pnpm install --frozen-lockfile

# Build (if using tsc)
RUN pnpm exec tsc

# Stage 2: run
FROM node:20-alpine

WORKDIR /app

# Copy built files from builder
COPY --from=builder /app .

# Expose port (example: 4000)
EXPOSE 4000

# Command to run service
CMD ["pnpm", "exec", "ts-node", "-r", "tsconfig-paths/register", "src/index.ts"]
