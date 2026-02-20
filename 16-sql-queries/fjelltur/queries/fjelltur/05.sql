-- Hent fjellnavn, høyde og navn på område for alle fjell.
SELECT fjellnavn, hoyde, navn FROM fjell INNER JOIN omraade omraade_id;
