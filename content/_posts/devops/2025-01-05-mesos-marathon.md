---
layout: default
title: "Mesos/Marathon : orchestration hétérogène"
tiitle: ""
tags:
  - devops
  - orchestration
  - mesos
---

# Mesos/Marathon : orchestration hétérogène

- Rôle : orchestrer workloads variés (big data, services stateful) quand k8s n’est pas homogène partout.
- Patterns : partitionnement par rôle (masters/agents), quotas, placement constraints, offres triées par ressources.
- Observabilité : metrics via exporters, logs agrégés (Loki/ELK), traces pour services frontaux exposés via Traefik/edge.
- Migration : cohabitation avec k8s, interop via gateways, plan de transition progressif vers un mesh unique.
