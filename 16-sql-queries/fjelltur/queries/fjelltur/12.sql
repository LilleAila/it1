-- Tell hvor mange turer en gitt person har gått. Du kan bruke brukernavnet "hausnes" for å hente dette.
SELECT person.fornavn, COUNT(fjelltur.brukernavn) AS antall_turer
FROM person
LEFT JOIN fjelltur ON person.brukernavn = fjelltur.brukernavn
WHERE person.brukernavn = "hausnes";
