import { testing, api } from "/lib.js";

const books = document.querySelector("#books");

const getData = async () => {
  // for testing locally without spamming the server
  const response = await fetch(testing ? "/books.json" : `${api}/books`);
  const data = await response.json();
  return data;
};

const initBooks = async () => {
  const data = await getData();

  // Siden oppgaven ber om å bruke document.createElement, gjør jeg det her
  // Koden blir fort veldig rotete om man skal holde seg til å kun bruke dette
  // Derfor minimerer jeg bruken av dette, og bruker heller template stringe med
  // innerHTML så mye som mulig. Dette gjør at jeg kan skrive koden litt som JSX
  books.innerHTML = "";
  for (let i = 0; i < data.length; i++) {
    const b = data[i];
    const e = document.createElement("li");
    e.innerHTML = `
      <h2><a href="/book?id=${i}">${b.name}<a></h2>
    `;
    books.appendChild(e);
  }
};

// Display data on page load
(async () => {
  await initBooks();
})();
