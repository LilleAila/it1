const main = document.querySelector(".content");
const username = document.querySelector("#username");

const formatter = new Intl.NumberFormat("nb-NO");

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
        <td><a href="/user/${p.id}">${p.username}</a></td>
        <td><span class="profit ${p.net_profit >= 0 ? "positive" : "negative"}">${formatter.format(p.net_profit)}<span></td>
      </tr>
    `,
      )
      .join("")}
  `;
}

await auth();
await getLeaderboard();
