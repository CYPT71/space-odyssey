---
layout: default
title: "Loki/Promtail : logs indexés et alertables"
tiitle: ""
tags:
  - devops
  - observability
  - logging
  - loki
---

# Loki/Promtail : logs indexés et alertables

- Labels normalisés (service, version, env, namespace, cluster) pour alignement metrics/traces.
- Pipelines Promtail : parsers nginx/json, relabeling, scrapes k8s; retention par classe de service.
- LogQL pour alertes (bursts d’erreurs, motifs récurrents), corrélation avec déploiements.
- Sécurité : filtrage PII, quotas par tenant, compression et stockage objet pour long terme.
