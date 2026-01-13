const form = document.querySelector("#form");
const results = document.querySelector("#results");

async function submit(e) {
  e.preventDefault();
  const data = new FormData(e.target);
  const response = await fetch(
    `https://api.dictionaryapi.dev/api/v2/entries/en/${data.get("query")}`,
  );

  if (response.status != 200) {
    results.innerHTML = `
      <div class="callout info">
        <p>The requested word was not found.</p>
      </div>
    `;
  } else if (response.status != 200) {
    results.innerHTML = `
      <div class="callout error">
        <p>An error occured.</p>
      </div>
    `;
  } else {
    const ds = await response.json();
    renderDefinitions(ds);
  }
}

async function fetchData(w) {
  const response = await fetch(
    `https://api.dictionaryapi.dev/api/v2/entries/en/${w}`,
  );

  if (response.status != 200) {
    results.innerHTML = `
      <div class="callout info">
        <p>The requested word was not found.</p>
      </div>
    `;
  } else if (response.status != 200) {
    results.innerHTML = `
      <div class="callout error">
        <p>An error occured.</p>
      </div>
    `;
  } else {
    const ds = await response.json();
    renderDefinitions(ds);
  }
}

function renderDefinitions(ds) {
  results.innerHTML = `
    <p class="summary">
      Found ${ds.length} definition${ds.length > 1 ? "s" : ""}.
    </p>
    ${ds
      .map(
        (d) => `
          <div>
            <h1 class="title"><code>${d.word}</code></h1>
            <ul class="definitions">
              <li class="phonetics">
                <ul>
                  ${mkList(
                    d.phonetics
                      .filter((p) => p.text)
                      .map(
                        (p) => `
                        ${p.text ? `<pre>${p.text}</pre>` : ""} ${
                          "audio" in p && p.audio
                            ? `
                            <audio controls>
                              <source src="${p.audio}" type="audio/mpeg">
                            </audio>
                            `
                            : ""
                        } ${"sourceUrl" in p ? `<span>(<a href="${p.sourceUrl}">Source</a> - ${mkLicense(p.license)})</span>` : ""}
                        `,
                      ),
                  )}
                </ul>
              </li>
              ${d.meanings
                .map(
                  (m) => `
                  <li>
                    <span class="type">${capitalize(m.partOfSpeech)}</span>
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
            <h2>Sources:</h2>
            <p>
              <ul>
                ${mkList(d.sourceUrls.map((u) => `<a href="${u}">${u}</a>`))}
              </ul>
              License: ${mkLicense(d.license)}
            </p>
          </div>
        `,
      )
      .join("<hr />")}
  `;
}

function mkList(xs) {
  return xs.map((x) => `<li>${x}</li>`).join("");
}

function mkLicense(l) {
  return `<a href="${l.url}">${l.name}</a>`;
}

function capitalize(str) {
  if (!str) return "";
  return str[0].toUpperCase() + str.slice(1).toLowerCase();
}

form.addEventListener("submit", (e) => {
  e.preventDefault();
  const data = new FormData(e.target);
  fetchData(data.get("query"));
});

// (() => {
//   // Debugging to automatically look up a word
//   form.query.value = "hello"; // success
//   // form.query.value = "helloooooooooo"; // failure
//   form.submit.click();
// })();
