---
layout: default
title: "Prometheus HA : sharding, alerting et SLO"
tiitle: ""
tags:
  - devops
  - observability
  - prometheus
---

# Prometheus HA : sharding, alerting et SLO

- Sharding/HA : deux instances par zone, remote_write vers Thanos, service discovery k8s, relabeling strict.
- Alerting : règles versionnées (gitops), budgets d’erreur, alertes SLO (latence/erreur) avec inhibition/aggregation.
- Performance : cardinalité maîtrisée (labels whitelisted), recording rules pour réduire CPU, scrape interval différencié par service.
- Sécurité : auth sur endpoints, limites de requêtes, isolation des tenants via labels et RBAC.
