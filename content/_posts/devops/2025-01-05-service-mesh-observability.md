---
layout: default
title: "Service Mesh & Observability Blueprint"
tiitle: ""
tags:
  - devops
  - mesh
  - observability
---

# Service Mesh & Observability Blueprint

## Mesh Control Plane
- **Istio** : mTLS par défaut, politiques RBAC fines, sidecars optimisés (proxy-concurrency, idle-timeouts), traffic shifting/canary avec budgets d’erreur, rate-limit via EnvoyFilter.  
- **Traefik** : Ingress/Edge, middlewares (auth, rate-limit, headers) et dashboard unifié; utile pour exposer des services publics ou hybrides.
- **Mesos/Marathon** : orchestration historique sur workloads hétérogènes; utile en transition ou pour des workloads stateful spécialisés (Hadoop/Spark).

## Traces & Profiling
- **Jaeger** : sampling adaptatif, propagation W3C, baggage sécurisé, alerts sur latence P95/P99, “trace diff” pour comparer releases.  
- **eBPF** (si possible) : capture kernel-level pour corréler avec traces applicatives.

## Metrics
- **Prometheus** : sharding/HA via Thanos, règles d’alerte versionnées (gitops), recording rules pour réduire coût CPU, multi-tenancy avec labels normalisés.  
- **Thanos** : store + compactor + querier; policies de rétention (court terme local, long terme objet).  
- **Service mesh metrics** : golden signals (latence, taux d’erreur, saturation, RPS) exportés par sidecars.

## Logs
- **Loki** : indexation par labels (service, version, namespace, cluster, env), retention par pipeline, alerting via LogQL (erreurs répétées, bursts).  
- **Promtail** : autodiscovery (k8s, static), parsers (nginx/json), relabeling pour aligner labels avec metrics/traces.

## Sécurité & Fiabilité
- mTLS mesh-wide, rotation auto des certs (Istiod), politiques d’accès par namespace/équipe.  
- **Chaos/Resilience** : fault injection (delays/abort), circuit breakers, retry budgets, outlier detection au niveau Envoy.  
- **Capacity/Scalabilité** : quotas par namespace, HPA/KEDA avec signaux Prometheus, throttling côté gateway.

## Flux d’équipe & Patterns
- **Guidance dev** : docs “service-ready” (SLO, budgets, playbooks), librairies client avec headers de trace, healthchecks standard.  
- **Design patterns** : retries idempotents, timeouts systématiques, back-pressure, bulkheads, partitionnement par domaine.  
- **Dashboards senior** : vues par service/équipe, drill-down trace→metrics→logs, corrélation déploiement/erreurs.

## Intégration rapide
- Terraform/Helm pour mesh + observabilité, valeurs par env (prod/stage/dev).  
- Pipelines CI/CD : validations lint (policies Istio, schémas Prom/LogQL), tests de config, smoke tests post-déploiement.  
- Migration progressive : namespace pilote, trafic mirroring, rollback automatique sur budget d’erreur dépassé.
