const main = document.querySelector(".content");
const username = document.querySelector("#username");

const formatter = new Intl.NumberFormat("nb-NO");
function formatProfit(n) {
  return `<span class="${n < 0 ? "negative" : "positive"}">${n >= 0 ? "+ " : "- "}${formatter.format(Math.abs(n))}</span>`;
}

async function auth() {
  const res = await fetch("/me");
  const data = await res.json();

  if (data.loggedIn) {
    main.classList.add("authenticated");
    username.textContent = data.user.username;
  }
}

async function getLeaderboard() {
  const res = await fetch("/api/leaderboard");
  const data = await res.json();

  console.log(data);

  const tbody = document.querySelector("#leaderboard-table tbody");
  tbody.innerHTML = `
    ${data
      .map(
        (p) => `
      <tr>
        <td><a href="/user/${p.id}" tabindex="1">${p.username}</a></td>
        <td>${formatProfit(p.net_profit)}</td>
      </tr>
    `,
      )
      .join("")}
  `;
}

await auth();
await getLeaderboard();
