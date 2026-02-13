// Diverse hjelpefunksjoner. Disse er i en egen fil fordi de blir importert av flere script-filer.

export const api = "https://www.anapioficeandfire.com/api";
export const testing = false;

export const optional = (x, v) => (x ? v : "");
export const pad = (v, n) => v.toString().padStart(n, "0");
// ISO8601 er det beste datoformatet. change my mind
export const iso8601date = (d) =>
  `${pad(d.getFullYear(), 2)}-${pad(d.getMonth(), 2)}-${pad(d.getDate(), 2)}`;
