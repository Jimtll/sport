# Plan — Session du 2026-05-22

## 1. 🐛 BUG critique : Programme ne montre pas les séances du Calendrier

### Cause racine identifiée
`refreshProgramUI()` ([index.html:4177](index.html:4177)) lit **toujours** `getWeekPlan(getISOWeek(new Date()))` — c-à-d **uniquement la semaine ISO courante**. Si l'utilisateur planifie une autre semaine dans le calendrier (typiquement la semaine prochaine), Programme ne voit rien et tombe sur le template du split.

`hasCustomPlan = calPlan && calPlan.days?.some(d => d.type !== 'rest')` exige au moins un jour ≠ rest dans la **semaine courante uniquement**.

### Fix
- Faire pointer Programme sur `selectedWeekKey ?? getISOWeek(new Date())` (la semaine sélectionnée dans le calendrier, sinon courante).
- Ajouter un sélecteur de semaine dans Programme (chevrons ◀ ▶ + label) et un bouton "Cette semaine".
- Mémoriser la semaine affichée dans `state` (pas dans localStorage — UI éphémère).

## 2. 🚀 Ajouter "Lancer la séance" sur Programme

Le user dit "je ne trouve aucune séance à lancer". Le clic-sur-exercice ouvre la modale logger, mais c'est pas évident.

- Bouton clair `▶ Lancer la séance` sur chaque day-card non-rest avec exercices.
- Au clic : sélectionne le jour + scroll sur `day-detail` + ouvre directement la modale du 1er exercice.

## 3. 🆕 4 nouveaux exercices

À ajouter à `EXERCISES` (IDs 56-59) avec `EX_DETAILS`, `EX_GIFS`, `EX_PHOTOS`, `EX_ANIM` :
| ID | Nom | Muscle | Level | Sets |
|----|-----|--------|-------|------|
| 56 | Presse inclinée fessiers | Fessiers | inter | 4×10-12 |
| 57 | Soulevé de terre barre guidée (Smith) — fessiers | Fessiers | inter | 4×8-10 |
| 58 | Tirage horizontal (rowing poulie basse) | Dos | debut | 4×10-12 |
| 59 | Tirage vertical (poulie prise neutre) | Dos | debut | 4×10-12 |

## 4. ⏱ Minuteur quand on lance la série

Ajouter un chrono de série DANS la modale logger :
- Bouton `▶` à côté de chaque ligne S1/S2/S3 → démarre un chrono en count-up affiché dans le label.
- Reset auto quand on coche ✓ (la série est terminée) → le rest timer prend le relai (existant).
- Pour les exercices time-based (gainage / dead hang / planche : sets format `3×45s` / `3×max`) → count-down depuis la durée parsée.

## 5. 🆕 Onglet Gainage

Nouveau onglet `page-gainage` avec :
- 3 niveaux : Débutant / Intermédiaire / Avancé
- Pour chaque niveau, ~5 exercices (Plank, Side plank, Hollow hold, Bird dog, Dead bug, etc.)
- Chrono intégré par exercice (count-down)
- Bouton play/pause/skip
- Audio beep à la fin (réutiliser `playBeep()`)
- Possibilité d'enchaîner toute la séance (next-exercise auto)

## 6. 🥗 Nutrition : objectifs + sédentaire

- Ajouter au select "Niveau d'activité" l'option : `Sédentaire (bureau, 0 sport)` avec multiplier 1.2
- Ajouter un select `Objectif` avant le surplus slider :
  - Perte de poids (déficit modéré -400)
  - Perte douce (déficit léger -200)
  - Maintien (0)
  - Léger surplus (+200)
  - Prise de masse (+400)
- Le select MET À JOUR le slider surplus automatiquement.
- Ajouter un sous-titre dynamique qui dit "Travail de bureau : compte ton activité quotidienne (sédentaire) + ajoute tes séances comme bonus" si activité = 1.2.

## 7. 🍽 Plan repas suggéré adapté

Le plan repas (`genMeals`) est statique. Le rendre dynamique selon objectif :
- Garder le **même format d'affichage**
- Mais avoir 3 jeux de repas (perte / maintien / prise) par profil → switch selon objectif

---

## Ordre d'exécution

1. ✅ Setup tasks/ + lecture context
2. ✅ Fix bug Programme (1) → smoke test
3. ✅ Bouton "Lancer la séance" (2)
4. ✅ Ajouter les 4 exercices (3)
5. ✅ Chrono série (4)
6. ✅ Onglet Gainage (5)
7. ✅ Nutrition objectifs (6) + plan repas adapté (7)
8. ✅ Validation JS syntax + commit + bump sw.js v16→v17 + push (commit `131a785`)
9. ✅ **BONUS** : Fix bug "programme identique entre profils" — profils dynamiques (user_xxx) crashaient `buildSplitSelect` car SPLITS_BY_PROFILE hardcodé sur lui/alexandra. Fallback par `splitsForProfile(pid)`. Bump v17→v18, push (commit `2a34964`).
