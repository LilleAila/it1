-- Hent bare fjellnavn og høyde for alle fjellene som har akkurat samme høyde.
SELECT fjellnavn, hoyde
FROM fjell
WHERE hoyde IN (
  SELECT hoyde
  FROM fjell
  GROUP BY hoyde
  HAVING COUNT(*) > 1
);
