# Dockerfile for React Frontend
# Build: docker build -t waste-management-ui .
# Run: docker run -p 5173:5173 waste-management-ui

FROM node:18-alpine

WORKDIR /app

# Install pnpm globally
RUN npm install -g pnpm

# Copy package files
COPY package.json pnpm-lock.yaml* ./

# Install dependencies
RUN pnpm install --frozen-lockfile

# Copy source code
COPY . .

# Build application
RUN pnpm build

# Expose port
EXPOSE 5173

# Start development server
CMD ["pnpm", "dev", "--host"]
