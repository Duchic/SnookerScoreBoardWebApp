var p1point = 0;
var p1break = 0;
var p2point = 0;
var p2break = 0;

var redcount = 15;
const COLOR_FINISH = 27;

var currentPlayer = "p1";

const RED = 1;
const BLACK = 7;
const PINK = 6;
const BLUE = 5;
const BROWN = 4;
const GREEN = 3;
const YELLOW = 2;


function Red(player) {
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
    if (player === "p1"){
        p2break = 0;
        p1break += BLACK;
        p1point += BLACK;
    } else {
        p1break = 0;
        p2break += BLACK;
        p2point += BLACK;
    }
    RefreshUI();
}

function Pink(player) {
    if (player === "p1"){
        p2break = 0;
        p1break += PINK;
        p1point += PINK;
    } else {
        p1break = 0;
        p2break += PINK;
        p2point += PINK;
    }
    RefreshUI();
}

function Blue(player) {
    if (player === "p1"){
        p2break = 0;
        p1break += BLUE;
        p1point += BLUE;
    } else {
        p1break = 0;
        p2break += BLUE;
        p2point += BLUE;
    }
    RefreshUI();
}

function Brown(player) {
    if (player === "p1"){
        p2break = 0;
        p1break += BROWN;
        p1point += BROWN;
    } else {
        p1break = 0;
        p2break += BROWN;
        p2point += BROWN;
    }
    RefreshUI();
}

function Green(player) {
    if (player === "p1"){
        p2break = 0;
        p1break += GREEN;
        p1point += GREEN;
    } else {
        p1break = 0;
        p2break += GREEN;
        p2point += GREEN;
    }
    RefreshUI();
}

function Yellow(player) {
    if (player === "p1"){
        p2break = 0;
        p1break += YELLOW;
        p1point += YELLOW;
    } else {
        p1break = 0;
        p2break += YELLOW;
        p2point += YELLOW;
    }
    RefreshUI();
}


function Foul7(player) {
    if (player === "p1"){
        p1break = 0;
        p2point += BLACK;
    } else {
        p2break = 0;
        p1point += BLACK;
    }
    RefreshUI();
}

function Foul6(player) {
    if (player === "p1"){
        p1break = 0;
        p2point += PINK;
    } else {
        p2break = 0;
        p1point += PINK;
    }
    RefreshUI();
}

function Foul5(player) {
    if (player === "p1"){
        p1break = 0;
        p2point += BLUE;
    } else {
        p2break = 0;
        p1point += BLUE;
    }
    RefreshUI();
}

function Foul4(player) {
    if (player === "p1"){
        p1break = 0;
        p2point += BROWN;
    } else {
        p2break = 0;
        p1point += BROWN;
    }
    RefreshUI();
}

function TogglePlayer() {
    if (currentPlayer === "p1") {
        p1break = 0;
        currentPlayer = "p2";
    } else {
        p2break = 0;
        currentPlayer = "p1";
    }
    RefreshUI();
}

function Reset() {
    p1point = 0;
    p1break = 0;
    p2point = 0;
    p2break = 0;
    redcount = 15;
    currentPlayer = "p1";
    RefreshUI();
}

function RefreshUI() {
    var remaining = Remaining();
    document.getElementById("p1points").innerHTML = 'Points: ' + p1point;
    document.getElementById("p1break").innerHTML = 'Break: ' + p1break;
    document.getElementById("p2points").innerHTML = 'Points: ' + p2point;
    document.getElementById("p2break").innerHTML = 'Break: ' + p2break;
    document.getElementById("ahead").innerText = AheadCount(p1point, p2point);
    document.getElementById("remaining").innerText = remaining;
    document.getElementById("maxPoints").innerText = Max(remaining);
    document.getElementById("toWin").innerText = ToWin();
    UpdateActivePlayer();
    UpdateProgressBars(remaining);
}

function UpdateActivePlayer() {
    var p1Name = document.getElementById("p1-name");
    var p2Name = document.getElementById("p2-name");
    if (currentPlayer === "p1") {
        p1Name.className = "center active-player-name";
        p2Name.className = "center inactive-player-name";
    } else {
        p1Name.className = "center inactive-player-name";
        p2Name.className = "center active-player-name";
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

    // score label — below bar, at end of solid portion
    var scoreLabelEl = document.getElementById("bar-score-label");
    scoreLabelEl.style.left  = currentPct + "%";
    scoreLabelEl.style.color = currentColor;
    scoreLabelEl.innerText   = myScore > 0 ? myScore : "";

    // max label — below bar, at end of potential portion
    var maxVal    = myScore + remaining;
    var maxPct    = clampPct(maxVal / scale * 100);
    var maxLabelEl = document.getElementById("bar-max-label");
    maxLabelEl.style.left  = maxPct + "%";
    maxLabelEl.style.color = currentColor;
    maxLabelEl.innerText   = maxVal;

    // marker = opponent's MAX (current + remaining):
    //   solid bar past marker  → opponent needs snooker to win
    //   full bar before marker → you cannot win even in best case
    var markerVal = oppScore + remaining;
    var markerPct = clampPct(markerVal / scale * 100);
    document.getElementById("bar-win-marker").style.left    = markerPct + "%";
    document.getElementById("bar-marker-label").innerText   = markerVal;
}

function clampPct(pct) {
    return Math.min(Math.max(pct, 0), 100);
}

function AheadCount(p1point, p2point) {
    return Math.abs(p1point - p2point);
}

function Remaining() {
    // each red can be followed by a black (max); plus final colored balls
    return (redcount * (RED + BLACK)) + COLOR_FINISH;
}

function Max(remaining) {
    // max achievable score for the trailing player
    return Math.min(p1point, p2point) + remaining;
}

function ToWin() {
    // points the trailing player needs to overtake the leader
    return AheadCount(p1point, p2point) + 1;
}

RefreshUI();
