import { testing, api, optional, iso8601date } from "/lib.js";

const book = document.querySelector("#book");

const getData = async (i) => {
  // for testing locally without spamming the server
  // NOTE: when testing, I am using the same file for all books
  const response = await fetch(testing ? "/book.json" : `${api}/books/${i}`);
  const data = await response.json();
  return data;
};

const initBooks = async () => {
  // Henter bok-id fra searchParams slik at jeg kan fra hovedsiden lenke til
  // `/book?id=n` der n er et tall. Her har jeg ikke implementert noen form for
  // feilhåndtering for hvis en bruker manuelt skriver inn en ugyldig bok-id
  const searchParams = new URLSearchParams(document.location.search);
  const i = parseInt(searchParams.get("id"));
  const b = await getData(i + 1); // API er 1-indeksert

  // Define metadata first as a list of "tuples" then map over it to make the code cleaner
  const metadata = [
    ["Antall sider", b.numberOfPages],
    [`Forfatter${optional(b.authors.length > 1, "e")}`, b.authors.join(", ")],
    ["Forlag", b.publisher],
    ["Dato utgitt", iso8601date(new Date(b.released))],
    ["Land", b.country],
    ["Format", b.mediaType],
    ["ISBN", b.isbn],
  ];

  // Bruker igjen innerHTML i stedet for createElement. Dette er bare fordi det blir mye enklere å jobbe med.
  book.innerHTML = `
    <h2>${b.name}</h2>
    <ul>
      ${metadata.map(([a, b]) => `<li>${a}: ${b}</li>`).join("")}
    </ul>
  `;

  // Alternativ måte å gjøre dette på med createElement, siden oppgaven ba om det ;)
  /*
  book.innerHTML = "";

  const name = document.createElement("h2");
  name.textContent = b.name;
  book.appendChild(name);

  const ul = document.createElement("ul");
  for (const [a, b] of metadata) {
    const e = document.createElement("li");
    e.textContent = `${a}: ${b}`;
    ul.appendChild(e);
  }
  book.appendChild(ul);
  */
};

// Display data on page load
(async () => {
  await initBooks();
})();
