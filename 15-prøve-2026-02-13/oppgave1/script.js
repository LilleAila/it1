// Diverse hjelpefunksjoner
const capitalize = (s) => s[0].toUpperCase() + s.slice(1);
const optional = (x, v) => (x ? v : "");

// Bruker et sett i stedet for en array for at det skal være mer effektivt (men har lite å si for så få verdier)
// I praksis ville jeg nok heller brukt en map siden jeg også vil lagre hvor mye rabattkoden er verdt.
const rabattkoder = new Set(["heihei", "abcdef", "rabattkode"]);

// Finne elementene
const form = document.querySelector("#form");
const result = document.querySelector("#result");

// Setter event listener på form (ikke knapp!)
form.addEventListener("submit", (e) => {
  e.preventDefault();
  form.style.display = "none"; // Skjul form

  // Hente data og validere koden
  const data = Object.fromEntries(new FormData(e.target));
  const validCode = rabattkoder.has(data.code);

  // Vis data. innerHTML er enklere enn createElement når man vil jobbe med flere elementer
  result.innerHTML = `
    <h1>Takk for din registrering, ${capitalize(data.firstname)}!</h1>
    ${optional(validCode, `<h2>Du har oppgitt en gyldig rabattkode og får en rabattert pris</h2>`)}
  `;
});
