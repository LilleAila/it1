-- Tell hvor mange turer det har vært totalt i 2025 for seg, og 2026 for seg.
SELECT STRFTIME("%Y", fjelltur.tidspunkt), COUNT(*)
FROM fjelltur
GROUP BY strftime("%Y", fjelltur.tidspunkt);
