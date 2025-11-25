---
layout: default
title: "Monitoring with Prometheus and Grafana"
date: 2024-11-10
tags: [monitoring, prometheus, grafana, observability]
category: devops
---

# Monitoring with Prometheus and Grafana

Set up a complete monitoring stack for your applications.

## The Stack

- **Prometheus** - Metrics collection and storage
- **Grafana** - Visualization and dashboards
- **Alertmanager** - Alert routing and management

## Quick Setup with Docker Compose

```yaml
version: '3.8'

services:
  prometheus:
    image: prom/prometheus:latest
    ports:
      - "9090:9090"
    volumes:
      - ./prometheus.yml:/etc/prometheus/prometheus.yml
      
  grafana:
    image: grafana/grafana:latest
    ports:
      - "3000:3000"
    environment:
      - GF_SECURITY_ADMIN_PASSWORD=admin
```

## Prometheus Configuration

```yaml
global:
  scrape_interval: 15s

scrape_configs:
  - job_name: 'my-app'
    static_configs:
      - targets: ['localhost:8080']
```

## Key Metrics to Monitor

- **CPU Usage** - System load
- **Memory** - RAM consumption
- **Disk I/O** - Read/write operations
- **Network** - Bandwidth usage
- **Application Metrics** - Request rate, error rate, duration

## Creating Dashboards

Import pre-built dashboards or create custom ones:
- Node Exporter Full
- Kubernetes Cluster Monitoring
- Application Performance

Monitor everything! 📊
