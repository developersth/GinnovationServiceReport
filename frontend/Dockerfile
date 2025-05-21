# Stage 1: Build the application
FROM node:18-alpine AS builder

# Set working directory
WORKDIR /app

# Copy package files first to leverage Docker cache
COPY package.json yarn.lock* package-lock.json* pnpm-lock.yaml* ./

# Install dependencies based on the preferred package manager
RUN \
  if [ -f yarn.lock ]; then yarn --frozen-lockfile; \
  elif [ -f package-lock.json ]; then npm ci; \
  elif [ -f pnpm-lock.yaml ]; then yarn global add pnpm && pnpm i --frozen-lockfile; \
  else echo "Lockfile not found." && exit 1; \
  fi

# Copy the rest of the application files
COPY . .

# Set environment variables for build
ENV NEXT_PUBLIC_API_BASE_URL=http://localhost:5000

# Build the application
RUN npm run build

# Stage 2: Production image
FROM node:18-alpine AS runner

WORKDIR /app

# Don't run production as root
RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs
USER nextjs

# Copy built application from builder
COPY --from=builder --chown=nextjs:nodejs /app/.next ./.next
COPY --from=builder --chown=nextjs:nodejs /app/node_modules ./node_modules
COPY --from=builder --chown=nextjs:nodejs /app/package.json ./package.json
COPY --from=builder --chown=nextjs:nodejs /app/public ./public

# Environment variables for runtime
ENV NODE_ENV=production
ENV NEXT_PUBLIC_API_BASE_URL=http://localhost:5000

# Next.js collects completely anonymous telemetry data about general usage
# Uncomment the following line to disable telemetry
# ENV NEXT_TELEMETRY_DISABLED 1

# Expose the port the app runs on
EXPOSE 3000

# Start the application
CMD ["npm", "start"]