// Word list taken from monkeytype source code: https://github.com/monkeytypegame/monkeytype/blob/master/frontend/static/languages/english.json
const language = await fetch("words.json").then((r) => r.json());
const words = language.words;

function randomFrom(list) {
  return list[Math.floor(Math.random() * list.length)];
}

function getWords(length) {
  return Array.from({ length }, () => randomFrom(words));
}

function removeChildren(elem) {
  while (elem.firstChild) {
    elem.removeChild(elem.firstChild);
  }
}

function floorTo(x, n) {
  const decimals = 10 ** n;
  return Math.floor(x * decimals) / decimals;
}

let activeTest = {
  started: false,
  length: 10,
  words: [],
  currentWord: 0,
};

const statsContainer = document.querySelector(".stats > tbody");
const wordContainer = document.querySelector(".text-display");
const input = document.querySelector("#text-input");

function newTest() {
  activeTest.started = false;
  activeTest.currentWord = 0;
  input.disabled = false;
  input.value = "";

  removeChildren(wordContainer);
  removeChildren(statsContainer);

  activeTest.words = getWords(activeTest.length).map((w) => {
    return { word: w, passed: false, correct: false };
  });

  renderWords();
}

document.querySelector("#new-test").addEventListener("click", newTest);

function renderWords() {
  for (let i = 0; i < activeTest.words.length; i++) {
    const w = activeTest.words[i];
    const element = document.createElement("span");
    element.className = "word";
    element.textContent = w.word;
    wordContainer.appendChild(element);
    w.element = element;
  }
}

function compareWords(word, target) {
  const length = Math.max(word.length, target.length);

  return Array.from({ length }, (_, i) => word[i] === target[i]).reduce(
    ([c, i], correct) => [c + correct, i + !correct],
    [0, 0],
  );
}

function submitWord(typed) {
  const word = activeTest.words[activeTest.currentWord];

  word.typed = typed;
  word.correct = word.typed === word.word;
  word.passed = true;

  [word.correctChars, word.incorrectChars] = compareWords(
    word.typed,
    word.word,
  );

  word.element.classList.add("passed");
  word.element.classList.add(word.correct ? "correct" : "incorrect");

  word.end = new Date();
  word.time = word.end - word.start; // In milliseconds

  activeTest.currentWord += 1;

  if (activeTest.currentWord >= activeTest.words.length) {
    endTest();
    return;
  }

  activeTest.words[activeTest.currentWord].start = new Date();
}

function formatTime(ms) {
  const minutes = Math.floor(ms / 60000);
  const seconds = Math.floor((ms % 60000) / 1000);
  const milliseconds = ms % 1000;

  return `${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}.${String(milliseconds).padStart(2, "0")}`;
}

function endTest() {
  input.disabled = true;

  // Time is counted per word to make it easier to expand in the future.
  // The difference is negligible compared to only comparing start and end times
  const time = activeTest.words.reduce((a, i) => a + i.time, 0);
  const minutes = time / 60000;

  const spaces = activeTest.words.length - 1;
  const chars =
    activeTest.words.reduce((a, i) => a + i.typed.length, 0) + spaces;
  const correctChars =
    activeTest.words.reduce((a, i) => a + i.correctChars, 0) + spaces;

  const rawWpm = chars / 5 / minutes; // Measure wpm with one word defined as 5 characters on average.
  const wpm = correctChars / 5 / minutes;
  const accuracy = (correctChars / chars) * 100;

  const stats = [
    ["WPM", `${floorTo(wpm, 1)}`],
    ["Raw WPM", `${floorTo(rawWpm, 1)}`],
    ["Accuracy", `${floorTo(accuracy, 1)}%`],
    ["Time", formatTime(time)],
  ];

  for (const [k, v] of stats) {
    const row = document.createElement("tr");

    const key = document.createElement("td");
    key.textContent = k;
    row.appendChild(key);

    const value = document.createElement("td");
    value.textContent = v;
    row.appendChild(value);

    statsContainer.appendChild(row);
  }
}

input.addEventListener("keydown", (e) => {
  if (activeTest.currentWord === 0 && !activeTest.started) {
    // Starts the test
    activeTest.started = true;
    activeTest.words[0].start = new Date();
  }
  if (e.key === " ") {
    // TODO: maybe remove the .toLowerCase() in the future to support quotes etc?
    submitWord(input.value.trim().toLowerCase());
    input.value = "";
    e.preventDefault();
  }
});

(() => {
  newTest();
})();
