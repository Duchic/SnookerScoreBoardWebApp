var p1point = 0;
var p1break = 0;
var p2point = 0;
var p2break = 0;

var redcount = 15;
const COLOR_FINISH = 27;
var colorsRemaining = COLOR_FINISH;
var finalColorPending = false;

var currentPlayer = "p1";

var p1frames = 0;
var p2frames = 0;

var undoStack = [];

const RED = 1;
const BLACK = 7;
const PINK = 6;
const BLUE = 5;
const BROWN = 4;
const GREEN = 3;
const YELLOW = 2;

var currentLanguage = LoadLanguage();

function IsLanguageSupported(language) {
    return typeof I18N !== "undefined" && I18N.languages && I18N.languages[language];
}

function LoadLanguage() {
    var language = "";
    try {
        language = localStorage.getItem("snookerScoreboardLanguage") || "";
    } catch (e) {}

    if (IsLanguageSupported(language)) return language;

    var browserLanguage = "";
    if (typeof navigator !== "undefined" && navigator.language) {
        browserLanguage = navigator.language.slice(0, 2).toLowerCase();
    }

    if (IsLanguageSupported(browserLanguage)) return browserLanguage;
    return typeof I18N !== "undefined" ? I18N.defaultLanguage : "en";
}

function T(key) {
    if (!IsLanguageSupported(currentLanguage)) return key;
    return I18N.languages[currentLanguage][key] || I18N.languages[I18N.defaultLanguage][key] || key;
}

function SetLanguage(language) {
    if (!IsLanguageSupported(language)) return;
    currentLanguage = language;
    try {
        localStorage.setItem("snookerScoreboardLanguage", language);
    } catch (e) {}
    ApplyLanguage();
    RefreshUI();
}

function SetValue(id, value) {
    var element = document.getElementById(id);
    if (element) element.value = value;
}

function SetText(id, value) {
    var element = document.getElementById(id);
    if (element) element.innerText = value;
}

function IsDefaultPlayerName(value, key) {
    for (var language in I18N.languages) {
        if (I18N.languages[language][key] === value) return true;
    }
    return false;
}

function SetPlayerDefaultName(id, key) {
    var element = document.getElementById(id);
    if (!element || !IsDefaultPlayerName(element.value, key)) return;
    element.value = T(key);
}

function ApplyLanguage() {
    document.documentElement.lang = currentLanguage;
    document.title = T("documentTitle");

    SetValue("lang-cs", T("languageCs"));
    SetValue("lang-en", T("languageEn"));
    document.getElementById("lang-cs").className = "BUTTON_LANG" + (currentLanguage === "cs" ? " active-language" : "");
    document.getElementById("lang-en").className = "BUTTON_LANG" + (currentLanguage === "en" ? " active-language" : "");

    SetPlayerDefaultName("p1-name", "player1");
    SetPlayerDefaultName("p2-name", "player2");

    var colors = ["red", "black", "pink", "blue", "brown", "green", "yellow"];
    colors.forEach(function(color) {
        SetValue("p1" + color, T(color));
        SetValue("p2" + color, T(color));
    });

    [7, 6, 5, 4].forEach(function(points) {
        SetValue("p1foul" + points, T("foul" + points));
        SetValue("p2foul" + points, T("foul" + points));
    });

    var frameLabels = document.getElementsByClassName("frame-score-label");
    for (var i = 0; i < frameLabels.length; i++) frameLabels[i].innerText = T("frames");

    var winButtons = document.getElementsByClassName("BUTTON_WIN_FRAME");
    for (var j = 0; j < winButtons.length; j++) winButtons[j].value = T("winFrame");

    SetValueByClass("BUTTON_SWITCH", T("switchPlayer"));
    SetValue("btn-undo", T("undo"));
    SetValueByClass("BUTTON_RESET", T("nextFrame"));
    SetValueByClass("BUTTON_NEW_MATCH", T("newMatch"));

    SetText("remaining_lbl", T("remaining"));
    SetText("maxPoints_lbl", T("yourMax"));
    SetText("toWin_lbl", T("youNeed"));
    SetText("legend-current-label", T("playerScore"));
    SetText("legend-potential-label", T("maxReachable"));
    SetText("legend-marker-label", T("opponentNeedsSnooker"));
}

function SetValueByClass(className, value) {
    var elements = document.getElementsByClassName(className);
    for (var i = 0; i < elements.length; i++) elements[i].value = value;
}

function saveState() {
    undoStack.push({
        p1point:         p1point,
        p1break:         p1break,
        p2point:         p2point,
        p2break:         p2break,
        redcount:        redcount,
        colorsRemaining: colorsRemaining,
        finalColorPending: finalColorPending,
        currentPlayer:   currentPlayer
    });
}

function Undo() {
    if (undoStack.length === 0) return;
    var state = undoStack.pop();
    p1point         = state.p1point;
    p1break         = state.p1break;
    p2point         = state.p2point;
    p2break         = state.p2break;
    redcount        = state.redcount;
    colorsRemaining = state.colorsRemaining;
    finalColorPending = state.finalColorPending;
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
        if (redcount === 0) finalColorPending = true;
    } else {
        p1break = 0;
        p2point += RED;
        p2break += RED;
        redcount--;
        if (redcount === 0) finalColorPending = true;
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
    if (redcount === 0) {
        if (finalColorPending) finalColorPending = false;
        else colorsRemaining -= BLACK;
    }
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
    if (redcount === 0) {
        if (finalColorPending) finalColorPending = false;
        else colorsRemaining -= PINK;
    }
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
    if (redcount === 0) {
        if (finalColorPending) finalColorPending = false;
        else colorsRemaining -= BLUE;
    }
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
    if (redcount === 0) {
        if (finalColorPending) finalColorPending = false;
        else colorsRemaining -= BROWN;
    }
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
    if (redcount === 0) {
        if (finalColorPending) finalColorPending = false;
        else colorsRemaining -= GREEN;
    }
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
    if (redcount === 0) {
        if (finalColorPending) finalColorPending = false;
        else colorsRemaining -= YELLOW;
    }
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
    undoStack = [];
    p1point = 0;
    p1break = 0;
    p2point = 0;
    p2break = 0;
    redcount = 15;
    colorsRemaining = COLOR_FINISH;
    finalColorPending = false;
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

    document.getElementById("p1points").innerHTML = T("points") + ': ' + p1point;
    document.getElementById("p1break").innerHTML  = T("breakLabel") + ': '  + p1break;
    document.getElementById("p2points").innerHTML = T("points") + ': ' + p2point;
    document.getElementById("p2break").innerHTML  = T("breakLabel") + ': '  + p2break;

    var gap = p1point - p2point;
    var aheadLbl = gap > 0 ? T("p1Ahead") : gap < 0 ? T("p2Ahead") : T("tied");
    document.getElementById("ahead_lbl").innerText  = aheadLbl;
    document.getElementById("ahead").innerText      = Math.abs(gap);

    document.getElementById("remaining").innerText  = remaining;
    document.getElementById("maxPoints").innerText  = myScore + remaining;

    var toWin = Math.max(0, oppScore + remaining - myScore + 1);
    var toWinEl   = document.getElementById("toWin");
    var maxEl     = document.getElementById("maxPoints");
    toWinEl.innerText  = toWin > 0 ? toWin : T("check");
    toWinEl.style.color  = toWin === 0                        ? "#1a8a1a" : "";
    maxEl.style.color    = myScore + remaining < oppScore     ? "#cc2200" : "";

    var f1 = document.getElementById("p1-frames"); if (f1) f1.innerText = p1frames;
    var f2 = document.getElementById("p2-frames"); if (f2) f2.innerText = p2frames;
    document.getElementById("btn-undo").disabled = undoStack.length === 0;
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

    if (redcount === 0 && finalColorPending) {
        var activePrefix = isP1 ? "p1" : "p2";
        document.getElementById(activePrefix + "red").disabled = true;
    } else if (redcount === 0) {
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
    if (redcount > 0) return (redcount * (RED + BLACK)) + colorsRemaining;
    return colorsRemaining + (finalColorPending ? BLACK : 0);
}


ApplyLanguage();
RefreshUI();
