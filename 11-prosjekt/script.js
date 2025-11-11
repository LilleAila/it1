// Word list taken from monkeytype source code: https://github.com/monkeytypegame/monkeytype/blob/master/frontend/static/languages/english.json
const language = await fetch("words.json").then((r) => r.json());
const words = language.words;

function randomFrom(list) {
  return list[Math.floor(Math.random() * list.length)];
}

function getWords(length) {
  return Array.from({ length }, () => randomFrom(words));
}

let activeTest = {
  length: 2,
  words: [],
  currentWord: 0,
};

function newTest() {
  activeTest.currentWord = 0;

  activeTest.words = getWords(activeTest.length).map((w) => {
    return { word: w, passed: false, correct: false };
  });

  renderWords();
}

function renderWords() {
  const wordContainer = document.querySelector(".text-display");

  while (wordContainer.firstChild) {
    wordContainer.removeChild(wordContainer.firstChild);
  }

  for (let i = 0; i < activeTest.words.length; i++) {
    const w = activeTest.words[i];
    const element = document.createElement("span");
    element.className = "word";
    element.id = `w-${i}`;
    element.textContent = w.word;
    wordContainer.appendChild(element);
  }
}

const input = document.querySelector("#text-input");

function submitWord(word) {
  activeTest.currentWord += 1;

  if (activeTest.currentWord >= activeTest.words.length) {
    console.log("oi du ferdig");
    input.disabled = true;
    // TODO: handle test done
    return;
  }

  const nextWord = activeTest.words[activeTest.currentWord];

  nextWord.correct = word == nextWord;
  nextWord.passed = true;

  const wordElement = document.querySelector(`#w-${activeTest.currentWord}`);
  // TODO: add the proper classes for passed and for incorrect
}

input.addEventListener("keydown", (e) => {
  if (e.key == " ") {
    // TODO: maybe remove the .toLowerCase() in the future to support quotes etc?
    submitWord(input.value.trim().toLowerCase());
    input.value = "";
    e.preventDefault();
  }
});

(() => {
  newTest();
  console.log(activeTest);
})();
