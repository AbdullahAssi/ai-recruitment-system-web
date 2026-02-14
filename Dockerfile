# Next.js Frontend Dockerfile - Production Ready (Single Stage)
FROM node:20-alpine

# Install system dependencies with timeout and minimal packages  
RUN apk add --no-cache --update libc6-compat openssl

WORKDIR /app

# Set NODE_ENV to production
ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1

# Copy package files
COPY package.json package-lock.json* ./

# Clear npm cache and install ALL dependencies (including dev for build)
RUN npm cache clean --force && \
    npm ci --prefer-offline && \
    npm cache clean --force

# Copy application code
COPY . .

# Generate Prisma Client
RUN npx prisma generate

# Build Next.js application
RUN npm run build

# Create non-root user
RUN addgroup --system --gid 1001 nodejs && \
    adduser --system --uid 1001 nextjs

# Create uploads directory and set permissions
RUN mkdir -p /app/uploads && chown -R nextjs:nodejs /app/uploads

USER nextjs

EXPOSE 3000

ENV PORT=3000
ENV HOSTNAME="0.0.0.0"

CMD ["npm", "start"]
