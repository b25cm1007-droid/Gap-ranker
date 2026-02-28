const quizzes = {
  languages: [
    { q: "Which language is used for web development?", options: ["C", "Python", "JavaScript", "Java"], answer: "JavaScript" },
    { q: "Python is a ___ typed language.", options: ["Statically", "Dynamically", "Manually", "None"], answer: "Dynamically" }
  ],
  semester: [
    { q: "What does DBMS stand for?", options: ["Database Management System", "Data Base Main Server", "Digital Base Management System", "None"], answer: "Database Management System" },
    { q: "Which protocol is used for secure communication?", options: ["HTTP", "FTP", "SMTP", "HTTPS"], answer: "HTTPS" }
  ]
};

function startQuiz(category) {
  document.getElementById("quizTitle").innerText = `Quiz: ${category.toUpperCase()}`;
  const quizContainer = document.getElementById("quizContainer");
  quizContainer.classList.remove("hidden");

  const questionsDiv = document.getElementById("questions");
  questionsDiv.innerHTML = "";

  quizzes[category].forEach((item, index) => {
    const qDiv = document.createElement("div");
    qDiv.innerHTML = `<p><strong>Q${index+1}:</strong> ${item.q}</p>`;
    
    item.options.forEach(opt => {
      const btn = document.createElement("button");
      btn.innerText = opt;
      btn.onclick = () => {
        if (opt === item.answer) {
          alert("✅ Correct!");
        } else {
          alert("❌ Wrong! Correct answer: " + item.answer);
        }
      };
      qDiv.appendChild(btn);
    });

    questionsDiv.appendChild(qDiv);
  });
}
