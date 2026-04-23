const userId = window.location.pathname.split("/").pop();

async function fetchUser() {
  const res = await fetch(`/api/user/${userId}`);
  const data = await res.json();

  console.log(data);

  document.querySelector("#username").textContent = data.summary.username;
  document.querySelector("#user-info").innerHTML = `
    <h2>Total invested: ${data.summary.total_invested}</h2>
    <h2>Net profit: ${data.summary.net_profit}</h2>
  `;
}

await fetchUser();
