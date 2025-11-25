---
layout: default
title: "Docker Best Practices"
date: 2024-11-18
tags: [docker, containers, devops]
category: tech
---

# Docker Best Practices

Docker has revolutionized how we build and deploy applications. Here are some best practices to follow.

## Image Optimization

### Use Multi-Stage Builds

```dockerfile
# Build stage
FROM node:18 AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

# Production stage
FROM node:18-alpine
WORKDIR /app
COPY --from=builder /app/dist ./dist
COPY package*.json ./
RUN npm ci --production
CMD ["node", "dist/index.js"]
```

### Minimize Layers

Combine RUN commands to reduce image layers:

```dockerfile
RUN apt-get update && \
    apt-get install -y curl && \
    apt-get clean && \
    rm -rf /var/lib/apt/lists/*
```

## Security

- Don't run as root
- Scan images for vulnerabilities
- Use official base images
- Keep images updated

## Performance

- Use `.dockerignore` to exclude unnecessary files
- Cache dependencies appropriately
- Use specific image tags, not `latest`

Build better containers! 🐳
