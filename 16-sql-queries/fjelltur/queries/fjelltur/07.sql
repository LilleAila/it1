-- Hent tidspunkt, varighet, beskrielse, fjellnavn og høyde for alle turer.
SELECT fjelltur.tidspunkt, fjelltur.varighet, fjelltur.beskrivelse, fjell.fjellnavn, fjell.hoyde
FROM fjelltur
INNER JOIN fjell ON fjelltur.fjell_id = fjell.fjell_id;
