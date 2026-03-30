const main = document.querySelector(".content");
const username = document.querySelector("#username");

const res = await fetch("/me");
const data = await res.json();

if (data.loggedIn) {
  main.classList.add("authenticated");
  username.textContent = data.user.username;
}
