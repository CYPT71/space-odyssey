---
layout: default
title: Entrée 016 – Le jour où j’ai trop découpé
---

🧭 Journal de bord – Entrée #016 : Le jour où j’ai trop découpé

Au début, tout était simple.
Un service → une fonction → une responsabilité.
Propre, clair, élégant.
Le genre de découpage qui fait respirer un système.

Puis j’ai découpé encore.
Encore un peu.
Et encore un peu.
Parce que “c’est plus moderne”, “plus scalable”, “plus micro”.

Jusqu’au jour où j’ai regardé mon architecture
et j’ai compris que j’avais créé un écosystème de nanoservices :
des morceaux tellement petits qu’ils passaient plus de temps
à s’appeler entre eux
qu’à faire quoi que ce soit d’utile.

Un service qui ne fait que transmettre une chaîne JSON.
Un autre qui appelle un autre service
juste pour valider trois caractères.
Des appels réseau là où un simple appel de fonction suffirait.
Et un orchestrateur qui gère tout ça
comme un parent épuisé gère une classe de maternelle.

À vue d’œil : cloud-native.
En vrai : ça hyperventile.

Le pire ?
Tout fonctionne.
Mais plus rien ne respire.

Chaque changement déclenche une avalanche de pipelines.
Chaque incident provient d’un service dont plus personne ne se souvient.
Redéployer l’ensemble ressemble à une opération chirurgicale en apesanteur.

C’est là que j’ai posé la vraie question :
“Est-ce que j’ai construit un système… ou un mille-feuille ?”

La vérité, c’est qu’on ne découpe pas toujours pour simplifier.
Parfois, on découpe pour se rassurer.
On cache la complexité dans le réseau, dans les dépendances,
dans des couches trop fines pour vivre seules.

Mais un système, comme un organisme, a besoin de volume.
Pas de miettes.

Un service doit être assez petit pour bouger vite,
assez large pour être vivant,
et assez cohérent pour qu’on puisse le comprendre
sans une carte stellaire.

Depuis, quand je sens que je suis en train de découper juste “pour faire propre”,
je respire.
Et j’arrête.
