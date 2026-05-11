var p1point = 0;
var p1break = 0;
var p2point = 0;
var p2break = 0;

var redcount = 15;
const COLOR_FINISH = 27;
var colorsRemaining = COLOR_FINISH;

var currentPlayer = "p1";

var p1frames = 0;
var p2frames = 0;

var history = [];

const RED = 1;
const BLACK = 7;
const PINK = 6;
const BLUE = 5;
const BROWN = 4;
const GREEN = 3;
const YELLOW = 2;


function saveState() {
    history.push({
        p1point:         p1point,
        p1break:         p1break,
        p2point:         p2point,
        p2break:         p2break,
        redcount:        redcount,
        colorsRemaining: colorsRemaining,
        currentPlayer:   currentPlayer
    });
}

function Undo() {
    if (history.length === 0) return;
    var state = history.pop();
    p1point         = state.p1point;
    p1break         = state.p1break;
    p2point         = state.p2point;
    p2break         = state.p2break;
    redcount        = state.redcount;
    colorsRemaining = state.colorsRemaining;
    currentPlayer   = state.currentPlayer;
    RefreshUI();
}

function Red(player) {
    saveState();
    if (player === "p1"){
        p2break = 0;
        p1break += RED;
        p1point += RED;
        redcount--;
    } else {
        p1break = 0;
        p2point += RED;
        p2break += RED;
        redcount--;
    }
    RefreshUI();
}

function Black(player) {
    saveState();
    if (player === "p1"){
        p2break = 0;
        p1break += BLACK;
        p1point += BLACK;
    } else {
        p1break = 0;
        p2break += BLACK;
        p2point += BLACK;
    }
    if (redcount === 0) colorsRemaining -= BLACK;
    RefreshUI();
}

function Pink(player) {
    saveState();
    if (player === "p1"){
        p2break = 0;
        p1break += PINK;
        p1point += PINK;
    } else {
        p1break = 0;
        p2break += PINK;
        p2point += PINK;
    }
    if (redcount === 0) colorsRemaining -= PINK;
    RefreshUI();
}

function Blue(player) {
    saveState();
    if (player === "p1"){
        p2break = 0;
        p1break += BLUE;
        p1point += BLUE;
    } else {
        p1break = 0;
        p2break += BLUE;
        p2point += BLUE;
    }
    if (redcount === 0) colorsRemaining -= BLUE;
    RefreshUI();
}

function Brown(player) {
    saveState();
    if (player === "p1"){
        p2break = 0;
        p1break += BROWN;
        p1point += BROWN;
    } else {
        p1break = 0;
        p2break += BROWN;
        p2point += BROWN;
    }
    if (redcount === 0) colorsRemaining -= BROWN;
    RefreshUI();
}

function Green(player) {
    saveState();
    if (player === "p1"){
        p2break = 0;
        p1break += GREEN;
        p1point += GREEN;
    } else {
        p1break = 0;
        p2break += GREEN;
        p2point += GREEN;
    }
    if (redcount === 0) colorsRemaining -= GREEN;
    RefreshUI();
}

function Yellow(player) {
    saveState();
    if (player === "p1"){
        p2break = 0;
        p1break += YELLOW;
        p1point += YELLOW;
    } else {
        p1break = 0;
        p2break += YELLOW;
        p2point += YELLOW;
    }
    if (redcount === 0) colorsRemaining -= YELLOW;
    RefreshUI();
}

function applyFoul(player, points) {
    saveState();
    if (player === "p1") {
        p1break = 0;
        p2point += points;
    } else {
        p2break = 0;
        p1point += points;
    }
    currentPlayer = player === "p1" ? "p2" : "p1";
    RefreshUI();
}

function Foul7(player) { applyFoul(player, BLACK); }
function Foul6(player) { applyFoul(player, PINK);  }
function Foul5(player) { applyFoul(player, BLUE);  }
function Foul4(player) { applyFoul(player, BROWN); }

function TogglePlayer() {
    saveState();
    if (currentPlayer === "p1") {
        p1break = 0;
        currentPlayer = "p2";
    } else {
        p2break = 0;
        currentPlayer = "p1";
    }
    RefreshUI();
}

function WinFrame(player) {
    if (player === "p1") p1frames++;
    else                 p2frames++;
    Reset();
}

function Reset() {
    history = [];
    p1point = 0;
    p1break = 0;
    p2point = 0;
    p2break = 0;
    redcount = 15;
    colorsRemaining = COLOR_FINISH;
    currentPlayer = "p1";
    RefreshUI();
}

function ResetMatch() {
    p1frames = 0;
    p2frames = 0;
    Reset();
}

function RefreshUI() {
    var remaining = Remaining();
    var isP1      = currentPlayer === "p1";
    var myScore   = isP1 ? p1point : p2point;
    var oppScore  = isP1 ? p2point : p1point;
    var diff      = myScore - oppScore;

    document.getElementById("p1points").innerHTML = 'Points: ' + p1point;
    document.getElementById("p1break").innerHTML  = 'Break: '  + p1break;
    document.getElementById("p2points").innerHTML = 'Points: ' + p2point;
    document.getElementById("p2break").innerHTML  = 'Break: '  + p2break;

    var aheadLbl = diff > 0 ? "Vedete o" : diff < 0 ? "Zaostáváte o" : "Remíza";
    document.getElementById("ahead_lbl").innerText  = aheadLbl;
    document.getElementById("ahead").innerText      = Math.abs(diff);

    document.getElementById("remaining").innerText  = remaining;
    document.getElementById("maxPoints").innerText  = myScore + remaining;

    var toWin = Math.max(0, oppScore + remaining - myScore + 1);
    var toWinEl   = document.getElementById("toWin");
    var maxEl     = document.getElementById("maxPoints");
    toWinEl.innerText  = toWin > 0 ? toWin : "✓";
    toWinEl.style.color  = toWin === 0                        ? "#1a8a1a" : "";
    maxEl.style.color    = myScore + remaining < oppScore     ? "#cc2200" : "";

    document.getElementById("p1-frames").innerText = p1frames;
    document.getElementById("p2-frames").innerText = p2frames;
    document.getElementById("btn-undo").disabled = history.length === 0;
    UpdateActivePlayer();
    UpdateProgressBars(remaining);
}

function UpdateActivePlayer() {
    var isP1 = currentPlayer === "p1";

    document.getElementById("p1-name").className = "player-name-input " + (isP1 ? "active-player-name" : "inactive-player-name");
    document.getElementById("p2-name").className = "player-name-input " + (isP1 ? "inactive-player-name" : "active-player-name");

    var p1Balls = ["p1red","p1black","p1pink","p1blue","p1brown","p1green","p1yellow"];
    var p2Balls = ["p2red","p2black","p2pink","p2blue","p2brown","p2green","p2yellow"];
    p1Balls.forEach(function(id) { document.getElementById(id).disabled = !isP1; });
    p2Balls.forEach(function(id) { document.getElementById(id).disabled =  isP1; });

    if (redcount === 0) {
        var colorSequence = {27: "yellow", 25: "green", 22: "brown", 18: "blue", 13: "pink", 7: "black"};
        var nextColor = colorSequence[colorsRemaining];
        var prefix = isP1 ? "p1" : "p2";
        ["red","black","pink","blue","brown","green","yellow"].forEach(function(color) {
            document.getElementById(prefix + color).disabled = (color !== nextColor);
        });
    }
}

function UpdateProgressBars(remaining) {
    var scale = 147;
    var isP1 = currentPlayer === "p1";

    var myScore  = isP1 ? p1point : p2point;
    var oppScore = isP1 ? p2point : p1point;
    var currentColor   = isP1 ? "#1155cc" : "#cc2200";
    var potentialColor = isP1 ? "#99bbf0" : "#f0a090";

    document.getElementById("bar-player-label").innerText             = isP1 ? "P1" : "P2";
    document.getElementById("bar-current").style.background           = currentColor;
    document.getElementById("bar-potential").style.background         = potentialColor;
    document.getElementById("legend-current-dot").style.background    = currentColor;
    document.getElementById("legend-potential-dot").style.background  = potentialColor;

    var currentPct   = Math.min(myScore / scale * 100, 100);
    var potentialPct = Math.min(remaining / scale * 100, 100 - currentPct);
    document.getElementById("bar-current").style.width   = currentPct + "%";
    document.getElementById("bar-potential").style.width = potentialPct + "%";

    var scoreLabelEl = document.getElementById("bar-score-label");
    scoreLabelEl.style.left  = currentPct + "%";
    scoreLabelEl.style.color = currentColor;
    scoreLabelEl.innerText   = myScore > 0 ? myScore : "";

    var maxVal     = myScore + remaining;
    var maxPct     = clampPct(maxVal / scale * 100);
    var maxLabelEl = document.getElementById("bar-max-label");
    maxLabelEl.style.left  = maxPct + "%";
    maxLabelEl.style.color = currentColor;
    maxLabelEl.innerText   = maxVal;

    var markerVal = oppScore + remaining;
    var markerPct = clampPct(markerVal / scale * 100);
    document.getElementById("bar-win-marker").style.left  = markerPct + "%";
    document.getElementById("bar-marker-label").innerText = markerVal;
}

function clampPct(pct) {
    return Math.min(Math.max(pct, 0), 100);
}

function AheadCount(p1point, p2point) {
    return Math.abs(p1point - p2point);
}

function Remaining() {
    return (redcount * (RED + BLACK)) + colorsRemaining;
}


RefreshUI();
