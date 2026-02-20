-- Tell hvor mange turer hver person har gått. Vis fornavn og "antall_turer".
SELECT person.fornavn, COUNT(fjelltur.brukernavn) AS antall_turer -- COUNT(fjelltur.brukernavn) instead of * to only include actual trips, and people with none will show as 0 because this is NULL.
FROM person -- Selecting from person to also include people with no trips
LEFT JOIN fjelltur ON person.brukernavn = fjelltur.brukernavn
GROUP BY person.brukernavn;
