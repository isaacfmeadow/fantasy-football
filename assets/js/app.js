console.log("Fantasy Assistant app loaded.");

document.addEventListener("DOMContentLoaded", () => {
  // Draft Lottery wiring
  const lotteryForm = document.getElementById("lotteryForm");
  const teamsTextarea = document.getElementById("lotteryTeams");
  const titleInput = document.getElementById("lotteryTitle");
  const errorEl = document.getElementById("lotteryError");
  const statusEl = document.getElementById("lotteryStatus");
  const resultsEl = document.getElementById("lotteryResults");
  const titleDisplayEl = document.getElementById("lotteryTitleDisplay");
  const runBtn = document.getElementById("runLotteryBtn");
  const speedSelect = document.getElementById("revealSpeed");
  const rerunBtn = document.getElementById("rerunLotteryBtn");
  const copyBtn = document.getElementById("copyLotteryBtn");
  const championBanner = document.getElementById("lotteryChampionBanner");
  const championTeamEl = document.getElementById("lotteryChampionTeam");

  if (!lotteryForm) {
    // Not on the lottery page
    return;
  }

  let revealIntervalId = null;
  let lastTeams = [];

  function shuffleArray(array) {
    // Fisher-Yates
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

  function startLottery(teams) {
    clearPreviousInterval();

    if (teams.length < 2) {
      errorEl.classList.remove("d-none");
      statusEl.textContent = "Need at least 2 teams.";
      return;
    }

    errorEl.classList.add("d-none");

    // Reset UI bits
    if (championBanner) {
      championBanner.classList.add("d-none");
    }
    if (championTeamEl) {
      championTeamEl.textContent = "";
    }

    const titleValue = titleInput?.value.trim() ?? "";
    if (titleDisplayEl) {
      titleDisplayEl.textContent = titleValue || "Draft Order Reveal";
    }

    // Determine speed
    let intervalMs = 1000;
    const speedValue = speedSelect?.value || "normal";
    if (speedValue === "slow") intervalMs = 1500;
    if (speedValue === "fast") intervalMs = 500;

    // Shuffle
    const shuffled = shuffleArray([...teams]);

    // Build rows: we want Pick 1 at top visually, Pick N at bottom,
    // but we reveal from bottom (last pick) up to 1st.
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

      // Prepend so Pick 1 ends up at the top in the final list
      resultsEl.prepend(li);
    }

    const pickRows = Array.from(
      resultsEl.querySelectorAll(".lottery-pick-row")
    );

    let revealIndex = pickRows.length - 1; // start from bottom
    const revealQueue = [...shuffled];

    if (runBtn) runBtn.disabled = true;
    if (rerunBtn) rerunBtn.disabled = true;
    if (copyBtn) copyBtn.disabled = true;

    statusEl.textContent = "Drawing teams...";

    revealIntervalId = setInterval(() => {
      if (revealIndex < 0 || revealQueue.length === 0) {
        clearPreviousInterval();

// Highlight 1st overall (Pick 1)
const firstRow = resultsEl.querySelector(
  '.lottery-pick-row[data-pick-number="1"]'
);
if (firstRow) {
  firstRow.classList.add("lottery-first-pick");
  const teamSpan = firstRow.querySelector(".lottery-pick-team");
  const teamName = teamSpan ? teamSpan.textContent : "";

  if (championTeamEl) {
    championTeamEl.textContent = teamName || "";
  }

  if (championBanner && teamName) {
    championBanner.classList.remove("d-none");

    // Restart animation cleanly each time
    championBanner.classList.remove("lottery-champion-animate");
    // Force reflow so the browser restarts the animation
    // eslint-disable-next-line no-unused-expressions
    championBanner.offsetWidth;
    championBanner.classList.add("lottery-champion-animate");
  }
}


        statusEl.textContent = "Lottery complete!";

        if (runBtn) runBtn.disabled = false;
        if (rerunBtn) rerunBtn.disabled = false;
        if (copyBtn) copyBtn.disabled = false;
        return;
      }

      const row = pickRows[revealIndex];
      const teamName = revealQueue.pop();
      const teamSpan = row.querySelector(".lottery-pick-team");

      if (teamSpan) {
        teamSpan.textContent = teamName;
      }

      row.classList.add("revealed");

      const pickNumber = row.dataset.pickNumber || "";
      statusEl.textContent = `Revealed Pick ${pickNumber}: ${teamName}`;

      revealIndex -= 1;
    }, intervalMs);
  }

  // Handle main submit
  lotteryForm.addEventListener("submit", (e) => {
    e.preventDefault();

    const raw = (teamsTextarea.value || "")
      .split("\n")
      .map((t) => t.trim())
      .filter((t) => t.length > 0);

    lastTeams = [...raw];
    startLottery(lastTeams);
  });

  // Rerun with same teams
  if (rerunBtn) {
    rerunBtn.addEventListener("click", () => {
      if (lastTeams.length >= 2) {
        startLottery(lastTeams);
      }
    });
  }

  // Copy draft order to clipboard
  if (copyBtn) {
    copyBtn.addEventListener("click", async () => {
      const rows = Array.from(
        resultsEl.querySelectorAll(".lottery-pick-row")
      );

      if (!rows.length) return;

      const lines = rows.map((row) => {
        const pick = row.dataset.pickNumber || "";
        const teamSpan = row.querySelector(".lottery-pick-team");
        const teamName = teamSpan ? teamSpan.textContent : "";
        return `${pick}. ${teamName}`;
      });

      const text = lines.join("\n");

      try {
        await navigator.clipboard.writeText(text);
        statusEl.textContent = "Draft order copied to clipboard!";
      } catch (err) {
        console.error("Clipboard error:", err);
        statusEl.textContent = "Could not copy. You can select and copy manually.";
      }
    });
  }
});


