# Oppgave 2

Oppgaven ber om å bruke `createElement` og å oppdatere innholdet på siden når man trykker på en bok. For å gjøre koden ryddigere og å virke på en måte som jeg mener er bedre, har jeg i stedet valgt å bruke `innerHTML` med template strings, og flyttet den detaljerte informasjonen om bøkene til en egen side heller enn å oppdatere innholdet. Jeg har skrevet generiske funksjoner, så om jeg heller skulle ønsket å ha en popup eller lignende på hovedf-siden, ville jeg bare ha flyttet funksjonene inn i root script-filen og endret hvilket element den peker mot, så i praksis ville koden vært nesten helt lik.

Testing av koden:

```sh
python3 -m http.server
```

(pass på at CWD er riktig, da koden flere ganger bruker lenker til root)
