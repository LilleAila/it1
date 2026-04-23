const main = document.querySelector(".content");
const username = document.querySelector("#username");

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

  const tbody = document.querySelector("#leaderboard-table tbody");
  tbody.innerHTML = `
    ${data
      .map(
        (p) => `
      <tr>
        <td><a href="/users/${p.id}">${p.username}</a></td>
        <td>${p.net_profit}</td>
      </tr>
    `,
      )
      .join("")}
  `;
}

await auth();
await getLeaderboard();
