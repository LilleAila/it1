const form = document.querySelector("#form");
const definitions = document.querySelector("#definitions");

async function submit(e) {
  e.preventDefault();
  const data = new FormData(e.target);
  const response = await fetch(
    `https://api.dictionaryapi.dev/api/v2/entries/en/${data.get("query")}`,
  );
  definitions.innerHTML = "";

  if (response.status != 200) {
    definitions.innerHTML = `
      <div class="error">
        <p>An error occured.</p>
      </div>
    `;
  } else {
    const ds = await response.json();
    for (const d of ds) {
      console.log(d);
      const e = document.createElement("div");
      e.innerHTML = `
        <h1>Definitions for <code>${d.word}<code>:</h1>
        <ul>
          ${d.meanings
            .map(
              (m) => `
              <li>
                <span>${m.partOfSpeech}</span>
                <ul>
                  ${mkList(
                    m.definitions.map(
                      (d) => `
                      <p>${d.definition}</p>
                      ${
                        d.synonyms.length > 0
                          ? `
                        <div>
                          <h4>Synonyms</h4>
                          <ul>
                            ${mkList(m.synonyms)}
                          </ul>
                        </div>
                      `
                          : ""
                      }
                      ${
                        d.antonyms.length > 0
                          ? `
                        <div>
                          <h4>Antonyms</h4>
                          <ul>
                            ${mkList(m.antonyms)}
                          </ul>
                        </div>
                      `
                          : ""
                      }
                      `,
                    ),
                  )}
                </ul>
                ${
                  m.synonyms.length > 0
                    ? `
                  <div>
                    <h3>Synonyms</h3>
                    <ul>
                      ${mkList(m.synonyms)}
                    </ul>
                  </div>
                `
                    : ""
                }
                ${
                  m.antonyms.length > 0
                    ? `
                  <div>
                    <h3>Antonyms</h3>
                    <ul>
                      ${mkList(m.antonyms)}
                    </ul>
                  </div>
                `
                    : ""
                }
              </li>
            `,
            )
            .join("")}
        </ul>
        <h2>Phonetics:</h2>
        <ul>
          ${mkList(
            d.phonetics.map(
              (p) => `
                ${p.text ? `<pre>${p.text}</pre>` : ""} ${
                  "audio" in p && p.audio
                    ? `
                    <audio controls>
                      <source src="${p.audio}" type="audio/mpeg">
                    </audio>
                    `
                    : ""
                } ${"sourceUrl" in p ? `(<a href="${p.sourceUrl}">Source</a> - ${mkLicense(p.license)})` : ""}
                `,
            ),
          )}
        </ul>
        <h2>Sources:</h2>
        <p>
          <ul>
            ${mkList(d.sourceUrls.map((u) => `<a href="${u}">${u}</a>`))}
          </ul>
          License: ${mkLicense(d.license)}
        </p>
      `;

      definitions.appendChild(e);
    }
  }
}

function mkList(xs) {
  return xs.map((x) => `<li>${x}</li>`).join("");
}

function mkLicense(l) {
  return `<a href="${l.url}">${l.name}</a>`;
}

form.addEventListener("submit", submit);

(() => {
  // Debugging to automatically look up a word
  form.query.value = "hello"; // success
  // form.query.value = "helloooooooooo"; // failure
  form.submit.click();
})();
