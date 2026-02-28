let gapMinutes = 0;
let sessionInterval;
let sessionSeconds = 0;
let sessionRunning = false;
let tabSwitchCount = 0;


// 🔥 GAP CALCULATION
function calculateGap() {

    const end = document.getElementById("endTime").value;
    const start = document.getElementById("startTime").value;

    if (!end || !start) {
        alert("Please enter both times.");
        return;
    }

    const endTime = new Date("1970-01-01T" + end + ":00");
    const startTime = new Date("1970-01-01T" + start + ":00");

    const diff = (startTime - endTime) / (1000 * 60);

    if (diff <= 0) {
        document.getElementById("gapResult").innerText = "Invalid time range.";
        return;
    }

    gapMinutes = diff;

    document.getElementById("gapResult").innerText =
        "Gap Time: " + gapMinutes + " minutes";
}


// 🔥 START SESSION
function startSession() {

    if (gapMinutes <= 0) {
        alert("Please calculate gap first.");
        return;
    }

    if (sessionRunning) {
        alert("Session already running!");
        return;
    }

    sessionRunning = true;
    sessionSeconds = 0;
    tabSwitchCount = 0;

    sessionInterval = setInterval(() => {

        sessionSeconds++;

        let minutes = Math.floor(sessionSeconds / 60);
        let seconds = sessionSeconds % 60;

        document.getElementById("timer").innerText =
            "Session Time: " + minutes + ":" +
            (seconds < 10 ? "0" : "") + seconds;

    }, 1000);
}


// 🔥 END SESSION + FEI CALCULATION
function endSession() {

    if (!sessionRunning) {
        alert("No active session.");
        return;
    }

    clearInterval(sessionInterval);
    sessionRunning = false;

    const focusedMinutes = sessionSeconds / 60;

    const fei = ((focusedMinutes / gapMinutes) * 100).toFixed(2);

    document.getElementById("fei").innerText =
        "FEI (Focus Efficiency Index): " + fei + "%";

    if (tabSwitchCount > 0) {
        document.getElementById("warning").innerText =
            "Warning: You switched tabs " + tabSwitchCount + " times!";
    }
}


// 🔥 TAB SWITCH DETECTION
document.addEventListener("visibilitychange", function () {

    if (document.hidden && sessionRunning) {
        tabSwitchCount++;
        document.getElementById("warning").innerText =
            "Focus Broken! Stay on this page.";
    }
});
