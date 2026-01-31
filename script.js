const STORAGE_KEY = "cs-quest-lab-data";
const LEVEL_STEP = 120;

const subjects = {
  Arrays: {
    description: "Work with ordered data and efficient iteration.",
    questions: [
      {
        prompt: "Given an array of integers, return the first index where the running sum is greater than 20.",
        hint: "Track a cumulative sum and return once it exceeds 20."
      },
      {
        prompt: "Find the longest strictly increasing contiguous segment in an array.",
        hint: "Keep a length counter that resets when the sequence breaks."
      },
      {
        prompt: "Rotate an array to the right by k steps without using extra arrays.",
        hint: "Try reversing segments: whole array, then two subarrays."
      }
    ]
  },
  Strings: {
    description: "Manipulate sequences of characters with precision.",
    questions: [
      {
        prompt: "Determine if two strings are one edit away (insert, delete, or replace).",
        hint: "Walk both strings with two pointers and allow only one mismatch."
      },
      {
        prompt: "Return the length of the longest substring without repeating characters.",
        hint: "Use a sliding window and track last seen positions."
      },
      {
        prompt: "Compress a string by replacing repeats with counts (aabccc -> a2b1c3).",
        hint: "Count streaks and reset when the character changes."
      }
    ]
  },
  Logic: {
    description: "Strengthen reasoning and flow control.",
    questions: [
      {
        prompt: "Given n, output 'Fizz', 'Buzz', or 'FizzBuzz' based on divisibility by 3 and 5.",
        hint: "Check divisibility by 15 first, then 3, then 5."
      },
      {
        prompt: "Determine whether a sequence of parentheses is balanced.",
        hint: "Keep a counter; it should never drop below zero and end at zero."
      },
      {
        prompt: "Given a grid of 0s and 1s, count the number of islands of 1s.",
        hint: "DFS/BFS each unvisited 1 and mark it visited."
      }
    ]
  },
  "Object Oriented Programming": {
    description: "Model systems with classes, objects, and clean interfaces.",
    questions: [
      {
        prompt: "Design a class for a library book with checkout, return, and status methods.",
        hint: "Track availability and who has the book."
      },
      {
        prompt: "Create a class hierarchy for vehicles with polymorphic start() methods.",
        hint: "Use a base class and override behavior in subclasses."
      },
      {
        prompt: "Build a simple BankAccount class with deposit, withdraw, and balance checks.",
        hint: "Validate that withdrawals do not drop below zero."
      }
    ]
  }
};

const accountStatus = document.getElementById("accountStatus");
const levelValue = document.getElementById("levelValue");
const pointsValue = document.getElementById("pointsValue");
const streakValue = document.getElementById("streakValue");
const progressFill = document.getElementById("progressFill");
const subjectPicker = document.getElementById("subjectPicker");
const questionTitle = document.getElementById("questionTitle");
const questionPrompt = document.getElementById("questionPrompt");
const helpBtn = document.getElementById("helpBtn");
const hintBox = document.getElementById("hintBox");
const solvedBtn = document.getElementById("solvedBtn");
const nextBtn = document.getElementById("nextBtn");
const accountForm = document.getElementById("accountForm");
const loginForm = document.getElementById("loginForm");
const logoutBtn = document.getElementById("logoutBtn");

const statsTargets = {
  Arrays: document.getElementById("arrayStats"),
  Strings: document.getElementById("stringStats"),
  Logic: document.getElementById("logicStats"),
  "Object Oriented Programming": document.getElementById("oopStats")
};

let appState = loadState();
let activeSubject = null;
let activeQuestionIndex = 0;

function loadState() {
  const raw = localStorage.getItem(STORAGE_KEY);
  if (!raw) {
    return { accounts: {}, activeAccount: null };
  }
  return JSON.parse(raw);
}

function saveState() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(appState));
}

function getActiveAccount() {
  if (!appState.activeAccount) {
    return null;
  }
  return appState.accounts[appState.activeAccount] || null;
}

function updateAccountStatus() {
  const account = getActiveAccount();
  if (!account) {
    accountStatus.textContent = "Not signed in";
    logoutBtn.classList.add("hidden");
    return;
  }
  accountStatus.textContent = `${account.name} · Level ${account.level}`;
  logoutBtn.classList.remove("hidden");
}

function pointsToLevel(points) {
  return Math.max(1, Math.floor(points / LEVEL_STEP) + 1);
}

function updateLevelDisplay() {
  const account = getActiveAccount();
  const points = account ? account.points : 0;
  const streak = account ? account.streak : 0;
  const level = pointsToLevel(points);
  const progress = (points % LEVEL_STEP) / LEVEL_STEP;

  levelValue.textContent = String(level);
  pointsValue.textContent = String(points);
  streakValue.textContent = String(streak);
  progressFill.style.width = `${progress * 100}%`;

  if (account) {
    account.level = level;
    saveState();
  }
}

function updateStats() {
  const account = getActiveAccount();
  Object.entries(statsTargets).forEach(([subject, target]) => {
    const solved = account?.progress?.[subject]?.solved || 0;
    const attempts = account?.progress?.[subject]?.attempts || 0;
    const total = subjects[subject].questions.length;
    target.innerHTML = `
      <li>Solved: ${solved} / ${total}</li>
      <li>Attempts: ${attempts}</li>
      <li>Mastery: ${Math.round((solved / total) * 100)}%</li>
    `;
  });
}

function ensureProgress(account) {
  if (!account.progress) {
    account.progress = {};
  }
  Object.keys(subjects).forEach((subject) => {
    if (!account.progress[subject]) {
      account.progress[subject] = { solved: 0, attempts: 0, lastSolved: null };
    }
  });
}

function renderSubjects() {
  subjectPicker.innerHTML = "";
  Object.keys(subjects).forEach((subject) => {
    const button = document.createElement("button");
    button.textContent = subject;
    button.classList.add("ghost");
    button.addEventListener("click", () => {
      activeSubject = subject;
      activeQuestionIndex = 0;
      showQuestion();
    });
    subjectPicker.appendChild(button);
  });
}

function showQuestion() {
  if (!activeSubject) {
    return;
  }
  const question = subjects[activeSubject].questions[activeQuestionIndex];
  questionTitle.textContent = `${activeSubject} · Question ${activeQuestionIndex + 1}`;
  questionPrompt.textContent = question.prompt;
  hintBox.textContent = question.hint;
  hintBox.classList.remove("visible");
  helpBtn.disabled = false;
  solvedBtn.disabled = false;
  nextBtn.disabled = false;
}

function updateProgressOnSolve() {
  const account = getActiveAccount();
  if (!account) {
    alert("Sign in or create an account to track progress.");
    return;
  }
  ensureProgress(account);
  const subjectProgress = account.progress[activeSubject];
  subjectProgress.attempts += 1;
  subjectProgress.solved += 1;
  subjectProgress.lastSolved = new Date().toISOString();
  account.points += 40;
  account.streak += 1;
  saveState();
  updateLevelDisplay();
  updateStats();
}

function updateProgressOnAttempt() {
  const account = getActiveAccount();
  if (!account) {
    return;
  }
  ensureProgress(account);
  const subjectProgress = account.progress[activeSubject];
  subjectProgress.attempts += 1;
  account.points += 10;
  account.streak = Math.max(0, account.streak - 1);
  saveState();
  updateLevelDisplay();
  updateStats();
}

accountForm.addEventListener("submit", (event) => {
  event.preventDefault();
  const formData = new FormData(accountForm);
  const name = formData.get("name").trim();
  const email = formData.get("email").trim();
  const password = formData.get("password");
  if (!name || !email || !password) {
    return;
  }
  if (appState.accounts[name]) {
    alert("Account already exists. Please sign in instead.");
    return;
  }
  appState.accounts[name] = {
    name,
    email,
    password,
    points: 0,
    level: 1,
    streak: 0,
    progress: {}
  };
  appState.activeAccount = name;
  saveState();
  accountForm.reset();
  ensureProgress(appState.accounts[name]);
  updateAccountStatus();
  updateLevelDisplay();
  updateStats();
});

loginForm.addEventListener("submit", (event) => {
  event.preventDefault();
  const formData = new FormData(loginForm);
  const name = formData.get("name").trim();
  const password = formData.get("password");
  const account = appState.accounts[name];
  if (!account || account.password !== password) {
    alert("Invalid credentials.");
    return;
  }
  appState.activeAccount = name;
  saveState();
  loginForm.reset();
  ensureProgress(account);
  updateAccountStatus();
  updateLevelDisplay();
  updateStats();
});

logoutBtn.addEventListener("click", () => {
  appState.activeAccount = null;
  saveState();
  updateAccountStatus();
  updateLevelDisplay();
  updateStats();
});

helpBtn.addEventListener("click", () => {
  hintBox.classList.toggle("visible");
  updateProgressOnAttempt();
});

solvedBtn.addEventListener("click", () => {
  updateProgressOnSolve();
});

nextBtn.addEventListener("click", () => {
  if (!activeSubject) {
    return;
  }
  activeQuestionIndex = (activeQuestionIndex + 1) % subjects[activeSubject].questions.length;
  showQuestion();
});

renderSubjects();
updateAccountStatus();
updateLevelDisplay();
updateStats();
