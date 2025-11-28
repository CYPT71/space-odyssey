---
layout: default
title: "Istio avancé : politique, performance et sécurité"
tiitle: ""
tags:
  - devops
  - mesh
  - observability
  - istio
---

# Istio avancé : politique, performance et sécurité

## Gouvernance
- mTLS mesh-wide, RBAC fin par namespace/équipe, contrôle des headers sensibles, fail-closed par défaut.
- Politiques de trafic : canary avec budgets d’erreur, rate-limit EnvoyFilter, outlier detection, retries idempotents + timeouts.

## Performance
- Sidecar tuning : proxy-concurrency, idle-timeouts, keepalive, captureModes ajustés; évitement des surcoûts via skipInbound/Outbound sur pods non meshés.
- Observabilité native : metrics Envoy (golden signals), traces envoyées vers Jaeger/OTel, logs access filtrés.

## Résilience
- Fault injection contrôlé, circuit breakers par destination, retry budgets pour éviter le storm.
- Sécurité supply chain : policy-as-code des manifests, validation CI des VirtualService/AuthorizationPolicy.
