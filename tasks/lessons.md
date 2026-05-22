# Leçons apprises sur SportDuo

Format : `[date] | ce qui a mal tourné | règle pour l'éviter`

- 2026-05-22 | `SPLITS_BY_PROFILE[pid]` retournait `undefined` pour les profils dynamiques (id `user_<timestamp>`), faisant crasher `buildSplitSelect` puis `refreshAll`. L'effet visible : le programme paraissait identique entre profils car le refresh était silencieusement avorté. | Toujours router les accès `SPLITS_BY_PROFILE[pid]`, `state.splits[pid]`, etc. via une fonction de résolution avec fallback (ici `splitsForProfile(pid)`). Le système de profils est dynamique (sp_profileList) depuis la migration, plus aucun id n'est garanti hardcodé.
- 2026-05-22 | `state.splits = { lui:..., alexandra:... }` était initialisé en dur sur 2 ids → pour tout 3e profil, lecture/écriture désynchronisées. | Initialiser `state.splits` en bouclant sur `sp_profileList` avec fallback par `goalBannerClass`.
- 2026-05-22 | `calcNutrition()` écrivait dans `dash-kcal` / `dash-prot` qui n'existent pas dans le DOM dashboard. Erreur silencieuse à chaque saisie nutrition. | Guard avec `const el = document.getElementById(...); if(el) el.textContent = ...` chaque fois qu'on touche un élément optionnel.
- 2026-05-22 | Le code lisait `LS('split_alex')` mais écrivait `SS('split_'+state.pid, ...)` → mismatch `sp_split_alex` vs `sp_split_alexandra`. | Cohérence de naming : si le suffixe est `state.pid`, lire avec le même suffixe.
- 2026-05-22 | `refreshProgramUI` lisait toujours `getISOWeek(new Date())` → impossible d'afficher dans Programme les séances planifiées pour une autre semaine (futur ou passé). | Pour les vues "lecture", respecter une semaine de navigation explicite (`progWeekKey`) avec fallback sur `selectedWeekKey` (calendrier) puis `getISOWeek(new Date())`.
