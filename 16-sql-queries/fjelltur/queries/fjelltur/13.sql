-- Vis en liste over alle fjellene som en gitt person har gått.
SELECT fjell.fjellnavn
FROM person
LEFT JOIN fjelltur ON person.brukernavn = fjelltur.brukernavn
LEFT JOIN fjell ON fjelltur.fjell_id = fjell.fjell_id
WHERE person.brukernavn = "hausnes";
