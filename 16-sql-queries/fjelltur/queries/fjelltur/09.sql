-- Tell hvor mange turer det har vært til Fanaråken (fjell_id = 1).
SELECT COUNT(*)
FROM fjelltur
INNER JOIN fjell ON fjelltur.fjell_id = fjell.fjell_id
WHERE fjell.fjellnavn = "Fanaråken";
