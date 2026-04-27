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

async function fetchGame() {
  const res = await fetch(`/api/game/${userId}`);
  const data = await res.json();
  const s = data.summary;
  console.log(data);

  const stats = [
    ["Start time", formatISO(new Date(s.start_time))],
    ["End time", formatISO(new Date(s.end_time))],
    ["Avg. pot size", formatter.format(s.average_pot_size)],
    ["Largest pot", formatter.format(s.largest_pot_of_game)],
    ["Total wagered", formatter.format(s.total_amount_wagered)],
    ["Buy ins", formatter.format(s.total_buy_in_count)],
    ["Total liquidity", formatter.format(s.total_liquidity_in_game)],
    ["Rounds", formatter.format(s.total_rounds_played)],
    ["Players", formatter.format(s.total_unique_players)],
  ];

  document.querySelector("#game-info tbody").innerHTML = stats
    .map(
      ([a, b]) => `
    <tr>
      <td>${a}</td>
      <td>${b}</td>
    </tr>
  `,
    )
    .join("");

  document.querySelector("#game-players tbody").innerHTML = data.users
    .map(
      (u) => `
    <tr class="user-row" data-href="/user/${u.user_id}" title="View detailed user info">
      <td>${u.username}<a href="/user/${u.user_id}" class="sr-only">View detailed user info</a></td>
      <td>${formatter.format(u.total_invested)}</td>
      <td>${formatProfit(u.net_profit)}</td>
    </tr>
    `,
    )
    .join("");

  document.querySelector("#game-rounds tbody").innerHTML = data.rounds
    .map(
      (r) => `
      <tr>
        <td>${formatter.format(r.round_number)}</td>
        <td>${r.winner_name}</td>
        <td>${formatProfit(r.amount_won)}</td>
        <td>${r.community_cards}</td>
        <td>${r.winning_hand}</td>
      </tr>
    `,
    )
    .join("");
}

document.querySelector("#game-players tbody").addEventListener("click", (e) => {
  const row = e.target.closest(".user-row");
  if (!row) return;
  const url = row.getAttribute("data-href");
  if (!url) return;
  window.location.href = url;
});

await fetchGame();
