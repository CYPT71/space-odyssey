---
layout: default
title: "Promtail : pipelines et bonnes pratiques"
tiitle: ""
tags:
  - devops
  - observability
  - logging
  - promtail
---

# Promtail : pipelines et bonnes pratiques

- Discovery : k8s pods/services, fichiers statiques, journald; exclusion de bruits (healthchecks).
- Pipelines : parsing JSON/nginx, stage `labels` pour aligner avec metrics, `timestamp` pour homogénéiser.
- Relabeling : suppression des labels à forte cardinalité, normalisation des env/versions.
- Résilience : backoff/retry sur Loki, limites de débit, buffers pour absorber les pics, TLS mTLS vers Loki.
