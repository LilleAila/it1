-- Hent det samme som fra oppgave 7, men bare for fjellturer til Fanaråken (fjell_id = 1)
SELECT fjelltur.tidspunkt, fjelltur.varighet, fjelltur.beskrivelse, fjell.fjellnavn, fjell.hoyde
FROM fjelltur
INNER JOIN fjell ON fjelltur.fjell_id = fjell.fjell_id
-- WHERE fjelltur.fjell_id = 1;
WHERE fjell.fjellnavn = "Fanaråken";
