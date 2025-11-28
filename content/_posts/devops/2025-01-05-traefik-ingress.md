---
layout: default
title: "Traefik en edge : sécuriser et exposer le mesh"
tiitle: ""
tags:
  - devops
  - mesh
  - ingress
---

# Traefik en edge : sécuriser et exposer le mesh

- Middlewares : auth (OIDC), rate-limit, headers de sécurité, redirections HTTPS.
- IngressRoute vs CRD Istio : positionner Traefik en edge public, filtrer/normaliser les headers avant entrée mesh.
- Observabilité : metrics Prometheus, logs structurés, traces OTel; dashboards pour RPS/latence/erreurs.
- Résilience : sticky sessions si nécessaire, backoff, timeouts, circuits; canary via weighted services.
