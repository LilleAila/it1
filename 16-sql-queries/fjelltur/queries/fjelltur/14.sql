-- Vis all informasjon untatt brukernavnet om en gitt person
SELECT fornavn, etternavn, epost
FROM person
WHERE brukernavn = "hausnes";
