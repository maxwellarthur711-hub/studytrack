const state = JSON.parse(localStorage.getItem("studytrack-state")) || {
  materials: [],
  quizzesCompleted: 0,
  bestScore: 0,
  studyPoints: 0
};

const quiz = [
  {
    question: "Which Git command shows the current state of your working files?",
    options: ["git status", "git clone", "git push", "git merge"],
    answer: "git status"
  },
  {
    question: "Which Git command sends your local commits to GitHub?",
    options: ["git pull", "git push", "git add", "git switch"],
    answer: "git push"
  },
  {
    question: "What is a commit?",
    options: ["A saved checkpoint in Git history", "A programming language", "A GitHub account", "A website server"],
    answer: "A saved checkpoint in Git history"
  }
];

const practice = {
  question: "Explain in your own words why a student might use GitHub for a school programming project.",
  keywords: ["backup", "version", "code", "project", "collaborat", "history", "share"]
};

document.getElementById("practiceQuestion").textContent = practice.question;

function saveState() {
  localStorage.setItem("studytrack-state", JSON.stringify(state));
}

function updateDashboard() {
  const materialCount = state.materials.length;
  const progress = Math.min(100, materialCount * 10 + Math.min(50, state.quizzesCompleted * 10) + Math.min(40, Math.floor(state.studyPoints / 10)));
  document.getElementById("materialCount").textContent = materialCount;
  document.getElementById("quizCount").textContent = state.quizzesCompleted;
  document.getElementById("bestScore").textContent = `${state.bestScore}%`;
  document.getElementById("studyPoints").textContent = state.studyPoints;
  document.getElementById("progressPercent").textContent = `${progress}%`;
  document.getElementById("progressBar").style.width = `${progress}%`;

  const list = document.getElementById("materialsList");
  list.innerHTML = "";
  state.materials.forEach((name) => {
    const item = document.createElement("div");
    item.className = "material-item";
    item.textContent = `📄 ${name}`;
    list.appendChild(item);
  });
}

function renderQuiz() {
  const container = document.getElementById("quizContainer");
  container.innerHTML = quiz.map((q, index) => `
    <div class="question-block">
      <p><strong>${index + 1}. ${q.question}</strong></p>
      ${q.options.map(option => `
        <label class="quiz-option">
          <input type="radio" name="q${index}" value="${option}" />
          ${option}
        </label>
      `).join("")}
    </div>
  `).join("");
}

document.getElementById("materialInput").addEventListener("change", async (event) => {
  const file = event.target.files[0];
  if (!file) return;

  if (!file.name.match(/\.(txt|md)$/i)) {
    document.getElementById("summaryBox").textContent = "Please choose a .txt or .md file for this first version.";
    return;
  }

  const text = await file.text();
  state.materials.push(file.name);
  state.studyPoints += 10;
  saveState();
  updateDashboard();

  const words = text.trim().split(/\s+/).filter(Boolean);
  const preview = words.slice(0, 80).join(" ");
  const sentences = text.split(/[.!?]+/).map(s => s.trim()).filter(Boolean).slice(0, 3);

  document.getElementById("summaryBox").innerHTML = `
    <div class="summary-title">Starter summary for ${file.name}</div>
    <p><strong>Key idea:</strong> ${sentences[0] || "No readable text was found."}</p>
    <p><strong>Quick review:</strong> ${preview || "No text was found in this file."}${words.length > 80 ? "…" : ""}</p>
    <p><em>This is a local starter summary. Later, we’ll replace it with real AI summarization.</em></p>
  `;

  event.target.value = "";
});

document.getElementById("submitQuiz").addEventListener("click", () => {
  let score = 0;
  quiz.forEach((q, index) => {
    const chosen = document.querySelector(`input[name="q${index}"]:checked`);
    if (chosen && chosen.value === q.answer) score++;
  });

  const percent = Math.round((score / quiz.length) * 100);
  state.quizzesCompleted += 1;
  state.bestScore = Math.max(state.bestScore, percent);
  state.studyPoints += score * 5;
  saveState();
  updateDashboard();

  document.getElementById("quizResult").textContent = `You scored ${score}/${quiz.length} (${percent}%).`;
});

document.getElementById("checkAnswer").addEventListener("click", () => {
  const answer = document.getElementById("practiceAnswer").value.trim().toLowerCase();
  const matches = practice.keywords.filter(keyword => answer.includes(keyword));
  const feedback = document.getElementById("practiceFeedback");

  if (!answer) {
    feedback.textContent = "Write an answer first.";
    return;
  }

  if (matches.length >= 2) {
    feedback.textContent = `Good attempt. Your answer mentions ${matches.length} useful idea(s). Keep developing your explanation.`;
    state.studyPoints += 5;
  } else {
    feedback.textContent = "Try again with more detail about backup, version history, sharing, or collaboration.";
  }

  saveState();
  updateDashboard();
});

document.getElementById("resetBtn").addEventListener("click", () => {
  localStorage.removeItem("studytrack-state");
  location.reload();
});

renderQuiz();
updateDashboard();
