---
layout: default
title: "Thanos : métriques longue durée et multi-cluster"
tiitle: ""
tags:
  - devops
  - observability
  - prometheus
  - thanos
---

# Thanos : métriques longue durée et multi-cluster

- Composants : sidecar/store/compactor/querier + bucket objet; downsampling et retention par période.
- Multi-cluster : fédération simple via label `cluster`, accès unifié aux séries; règles globales.
- Coût/perf : recording rules locales, compaction aggressive, requêtes filtrées par labels pour éviter le fanout massif.
- Fiabilité : stores en HA, bucket versionné, alertes sur compaction et lag des sidecars.
