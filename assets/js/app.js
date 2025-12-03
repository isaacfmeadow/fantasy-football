console.log("Fantasy Assistant app loaded.");

document.addEventListener("DOMContentLoaded", () => {
  // Only run this on the draft lottery page
  const lotteryForm = document.getElementById("lotteryForm");
  const teamsTextarea = document.getElementById("lotteryTeams");
  const titleInput = document.getElementById("lotteryTitle");
  const errorEl = document.getElementById("lotteryError");
  const statusEl = document.getElementById("lotteryStatus");
  const resultsEl = document.getElementById("lotteryResults");
  const titleDisplayEl = document.getElementById("lotteryTitleDisplay");
  const runBtn = document.getElementById("runLotteryBtn");

  if (!lotteryForm) {
    // We're not on the lottery page, nothing to do
    return;
  }

  let revealIntervalId = null;

  function shuffleArray(array) {
    // Fisher-Yates shuffle
    for (let i = array.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [array[i], array[j]] = [array[j], array[i]];
    }
    return array;
  }

  function clearPreviousInterval() {
    if (revealIntervalId !== null) {
      clearInterval(revealIntervalId);
      revealIntervalId = null;
    }
  }

  lotteryForm.addEventListener("submit", (e) => {
    e.preventDefault();
    clearPreviousInterval();

    const raw = (teamsTextarea.value || "")
      .split("\n")
      .map((t) => t.trim())
      .filter((t) => t.length > 0);

    if (raw.length < 2) {
      errorEl.classList.remove("d-none");
      statusEl.textContent = "Need at least 2 teams.";
      return;
    }

    errorEl.classList.add("d-none");

    const titleValue = titleInput.value.trim();
    titleDisplayEl.textContent = titleValue || "Draft Order Reveal";

    // Shuffle teams to get a random draft order
    const shuffled = shuffleArray([...raw]);

    // Build placeholder rows (no teams yet, just pick numbers)
    resultsEl.innerHTML = "";
    const total = shuffled.length;

    for (let i = total; i >= 1; i--) {
        const li = document.createElement("li");
        li.className = "lottery-pick-row";
        li.dataset.pickNumber = i.toString();
        li.dataset.teamName = ""; 
      
        const numberSpan = document.createElement("span");
        numberSpan.className = "lottery-pick-number";
        numberSpan.textContent = `Pick ${i}`;
      
        const teamSpan = document.createElement("span");
        teamSpan.className = "lottery-pick-team";
        teamSpan.textContent = "???";
      
        li.appendChild(numberSpan);
        li.appendChild(teamSpan);
      
        // NEW LINE — show Pick 1 at top, Pick N at bottom
        resultsEl.prepend(li);
      }
      

    // Set up reveal from last pick up to first
    const pickRows = Array.from(
      resultsEl.querySelectorAll(".lottery-pick-row")
    );

    // We will reveal from the bottom (last pick) to the top (1st pick)
    let revealIndex = pickRows.length - 1;
    statusEl.textContent = "Drawing teams...";

    // Copy of shuffled so we can pop from end for suspense
    const revealQueue = [...shuffled];

    runBtn.disabled = true;

    revealIntervalId = setInterval(() => {
      if (revealIndex < 0 || revealQueue.length === 0) {
        clearPreviousInterval();
        statusEl.textContent = "Lottery complete!";
        runBtn.disabled = false;
        return;
      }

      const row = pickRows[revealIndex];
      const teamName = revealQueue.pop(); // last team gets current pick
      const teamSpan = row.querySelector(".lottery-pick-team");

      if (teamSpan) {
        teamSpan.textContent = teamName;
      }
      row.classList.add("revealed");

      // Update status text
      const pickNumber = row.dataset.pickNumber || "";
      statusEl.textContent = `Revealed Pick ${pickNumber}: ${teamName}`;

      revealIndex -= 1;
    }, 1000); // 1 second between reveals
  });
});

