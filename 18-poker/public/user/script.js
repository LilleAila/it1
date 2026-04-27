const userId = window.location.pathname.split("/").pop();

const formatter = new Intl.NumberFormat("nb-NO");
function formatProfit(n) {
  return `<span class="${n < 0 ? "negative" : "positive"}">${n >= 0 ? "+ " : "- "}${formatter.format(Math.abs(n))}</span>`;
}
function formatISO(date) {
  const pad = (num) => String(num).padStart(2, "0");

  const year = date.getFullYear();
  const month = pad(date.getMonth() + 1); // Months are 0-indexed
  const day = pad(date.getDate());
  const hours = pad(date.getHours());
  const minutes = pad(date.getMinutes());

  return `${year}-${month}-${day} ${hours}:${minutes}`;
}

async function fetchUser() {
  const res = await fetch(`/api/user/${userId}`);
  const data = await res.json();
  const s = data.summary;
  console.log(data);

  document.querySelector("#username").textContent = s.username;

  const stats = [
    ["Username", s.username],
    ["Created", formatISO(new Date(s.created_at))],
    ["Avg. buy in", formatter.format(s.avg_buy_in_amount)],
    ["Avg. contribution", formatter.format(s.avg_contribution)],
    ["Games played", formatter.format(s.games_played)],
    ["Rounds played", formatter.format(s.total_rounds)],
    ["Net profit", formatProfit(s.net_profit)],
    ["Total invested", formatter.format(s.total_invested)],
    ["Total won", formatter.format(s.total_won)],
    ["Biggest win", formatProfit(s.biggest_win)],
    [
      `<abbr title="Voulantarily Puts into Pot">VPIP</abbr>`,
      `${s.vpip_percentage}%`,
    ],
    ["Fold percentage", `${s.fold_percentage}%`],
    ["Showdown win rate", `${s.showdown_win_percentage}%`],
  ];

  document.querySelector("#user-info tbody").innerHTML = stats
    .map(
      ([a, b]) => `
    <tr>
      <td>${a}</td>
      <td>${b}</td>
    </tr>
  `,
    )
    .join("");

  document.querySelector("#user-games tbody").innerHTML = data.games
    .map(
      (g) => `
    <tr class="game-row" data-href="/games/${g.id}" title="View detailed game info">
      <td>${formatISO(new Date(g.start_time))}<a href="/games/${g.id}" class="sr-only">View detailed game info</a></td>
      <td>${formatter.format(g.rounds)}</td>
      <td>${g.participants}</td>
    </tr>
  `,
    )
    .join("");
}

document.querySelector("#user-games tbody").addEventListener("click", (e) => {
  const row = e.target.closest(".game-row");
  if (!row) return;
  const url = row.getAttribute("data-href");
  if (!url) return;
  window.location.href = url;
});

await fetchUser();
