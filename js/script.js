var p1point = 0;
var p1break = 0;
var p2point = 0;
var p2break = 0;

var redcount = 15;
const COLOR_FINISH = 27;
var colorsRemaining = COLOR_FINISH;

const PHASE_REDS = "reds";
const PHASE_COLOR_AFTER_RED = "colorAfterRed";
const PHASE_COLORS = "colors";
const PHASE_RESPOTTED_BLACK = "respottedBlack";
const PHASE_FRAME_OVER = "frameOver";
var gamePhase = PHASE_REDS;

var currentPlayer = "p1";
var frameStarter = "p1";
var playAgainAvailable = false;
var foulOffender = null;

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
    SetValue("btn-play-again", T("playAgain"));
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
        gamePhase:       gamePhase,
        currentPlayer:   currentPlayer,
        frameStarter:    frameStarter,
        playAgainAvailable: playAgainAvailable,
        foulOffender:    foulOffender
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
    gamePhase        = state.gamePhase;
    currentPlayer   = state.currentPlayer;
    frameStarter    = state.frameStarter;
    playAgainAvailable = state.playAgainAvailable;
    foulOffender    = state.foulOffender;
    RefreshUI();
}

function ClearPlayAgainOption() {
    playAgainAvailable = false;
    foulOffender = null;
}

function Red(player) {
    if (player !== currentPlayer || gamePhase !== PHASE_REDS || redcount <= 0) return;
    saveState();
    ClearPlayAgainOption();
    if (player === "p1"){
        p2break = 0;
        p1break += RED;
        p1point += RED;
    } else {
        p1break = 0;
        p2point += RED;
        p2break += RED;
    }
    redcount--;
    gamePhase = PHASE_COLOR_AFTER_RED;
    RefreshUI();
}

function GetNextColorValue() {
    var colorSequence = {27: YELLOW, 25: GREEN, 22: BROWN, 18: BLUE, 13: PINK, 7: BLACK};
    return colorSequence[colorsRemaining];
}

function CanPotColor(player, value) {
    if (player !== currentPlayer) return false;
    if (gamePhase === PHASE_COLOR_AFTER_RED) return true;
    if (gamePhase === PHASE_COLORS) return value === GetNextColorValue();
    return gamePhase === PHASE_RESPOTTED_BLACK && value === BLACK;
}

function EnterRespottedBlack() {
    p1break = 0;
    p2break = 0;
    colorsRemaining = BLACK;
    gamePhase = PHASE_RESPOTTED_BLACK;
    alert(T("respottedBlack"));
}

function UpdatePhaseAfterColor(value) {
    if (gamePhase === PHASE_COLOR_AFTER_RED) {
        gamePhase = redcount > 0 ? PHASE_REDS : PHASE_COLORS;
        return;
    }

    if (gamePhase === PHASE_RESPOTTED_BLACK) {
        colorsRemaining = 0;
        gamePhase = PHASE_FRAME_OVER;
        return;
    }

    colorsRemaining -= value;
    if (colorsRemaining === 0) {
        if (p1point === p2point) {
            EnterRespottedBlack();
        } else {
            gamePhase = PHASE_FRAME_OVER;
        }
    }
}

function PotColor(player, value) {
    if (!CanPotColor(player, value)) return;
    saveState();
    ClearPlayAgainOption();
    if (player === "p1"){
        p2break = 0;
        p1break += value;
        p1point += value;
    } else {
        p1break = 0;
        p2break += value;
        p2point += value;
    }
    UpdatePhaseAfterColor(value);
    RefreshUI();
}

function Black(player)  { PotColor(player, BLACK);  }
function Pink(player)   { PotColor(player, PINK);   }
function Blue(player)   { PotColor(player, BLUE);   }
function Brown(player)  { PotColor(player, BROWN);  }
function Green(player)  { PotColor(player, GREEN);  }
function Yellow(player) { PotColor(player, YELLOW); }

function applyFoul(player, points) {
    if (player !== currentPlayer || gamePhase === PHASE_FRAME_OVER) return;
    saveState();
    ClearPlayAgainOption();
    if (player === "p1") {
        p1break = 0;
        p2point += points;
    } else {
        p2break = 0;
        p1point += points;
    }
    currentPlayer = player === "p1" ? "p2" : "p1";

    if (gamePhase === PHASE_RESPOTTED_BLACK) {
        colorsRemaining = 0;
        gamePhase = PHASE_FRAME_OVER;
    } else if (gamePhase === PHASE_COLORS && colorsRemaining === BLACK) {
        if (p1point === p2point) {
            EnterRespottedBlack();
        } else {
            colorsRemaining = 0;
            gamePhase = PHASE_FRAME_OVER;
        }
    } else if (gamePhase === PHASE_COLOR_AFTER_RED) {
        gamePhase = redcount > 0 ? PHASE_REDS : PHASE_COLORS;
    }

    if (gamePhase !== PHASE_FRAME_OVER && gamePhase !== PHASE_RESPOTTED_BLACK) {
        playAgainAvailable = true;
        foulOffender = player;
    }
    RefreshUI();
}

function Foul7(player) { applyFoul(player, BLACK); }
function Foul6(player) { applyFoul(player, PINK);  }
function Foul5(player) { applyFoul(player, BLUE);  }
function Foul4(player) { applyFoul(player, BROWN); }

function PlayAgain() {
    if (!playAgainAvailable || !foulOffender || gamePhase === PHASE_FRAME_OVER) return;
    saveState();
    currentPlayer = foulOffender;
    p1break = 0;
    p2break = 0;
    ClearPlayAgainOption();
    RefreshUI();
}

function TogglePlayer() {
    if (gamePhase === PHASE_FRAME_OVER) return;
    var selectingFrameStarter = gamePhase === PHASE_REDS && redcount === 15 &&
        p1point === 0 && p2point === 0;
    saveState();
    ClearPlayAgainOption();
    if (currentPlayer === "p1") {
        p1break = 0;
        currentPlayer = "p2";
    } else {
        p2break = 0;
        currentPlayer = "p1";
    }
    if (selectingFrameStarter) frameStarter = currentPlayer;
    if (gamePhase === PHASE_COLOR_AFTER_RED) {
        gamePhase = redcount > 0 ? PHASE_REDS : PHASE_COLORS;
    }
    RefreshUI();
}

function WinFrame(player) {
    if (player === "p1") p1frames++;
    else                 p2frames++;
    Reset(true);
}

function NextFrame() {
    if (gamePhase !== PHASE_FRAME_OVER) {
        alert(T("frameInProgress"));
    } else if (p1point > p2point) {
        p1frames++;
        Reset(true);
    } else if (p2point > p1point) {
        p2frames++;
        Reset(true);
    } else {
        alert(T("selectFrameWinner"));
    }
}

function Reset(advanceStarter) {
    if (advanceStarter) frameStarter = frameStarter === "p1" ? "p2" : "p1";
    undoStack = [];
    p1point = 0;
    p1break = 0;
    p2point = 0;
    p2break = 0;
    redcount = 15;
    colorsRemaining = COLOR_FINISH;
    gamePhase = PHASE_REDS;
    currentPlayer = frameStarter;
    ClearPlayAgainOption();
    RefreshUI();
}

function ResetMatch() {
    p1frames = 0;
    p2frames = 0;
    frameStarter = "p1";
    Reset(false);
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

    var snookerTarget = GetSnookerTarget(myScore, oppScore, remaining);
    var toWinEl   = document.getElementById("toWin");
    var maxEl     = document.getElementById("maxPoints");
    toWinEl.innerText    = snookerTarget.reachable ? (snookerTarget.pointsNeeded > 0 ? snookerTarget.pointsNeeded : T("check")) : T("snookerNeeded");
    toWinEl.style.color  = snookerTarget.pointsNeeded === 0 ? "#1a8a1a" : snookerTarget.reachable ? "" : "#cc2200";
    maxEl.style.color    = myScore + remaining <= oppScore ? "#cc2200" : "";

    var f1 = document.getElementById("p1-frames"); if (f1) f1.innerText = p1frames;
    var f2 = document.getElementById("p2-frames"); if (f2) f2.innerText = p2frames;
    document.getElementById("btn-undo").disabled = undoStack.length === 0;
    UpdateActivePlayer();
    UpdateProgressBars(remaining);
}

function UpdateActivePlayer() {
    var isP1 = currentPlayer === "p1";
    var frameOver = gamePhase === PHASE_FRAME_OVER;

    document.getElementById("p1-name").className = "player-name-input " + (isP1 ? "active-player-name" : "inactive-player-name");
    document.getElementById("p2-name").className = "player-name-input " + (isP1 ? "inactive-player-name" : "active-player-name");

    var p1Balls = ["p1red","p1black","p1pink","p1blue","p1brown","p1green","p1yellow"];
    var p2Balls = ["p2red","p2black","p2pink","p2blue","p2brown","p2green","p2yellow"];
    p1Balls.forEach(function(id) { document.getElementById(id).disabled = frameOver || !isP1; });
    p2Balls.forEach(function(id) { document.getElementById(id).disabled = frameOver ||  isP1; });

    [4, 5, 6, 7].forEach(function(points) {
        document.getElementById("p1foul" + points).disabled = frameOver || !isP1;
        document.getElementById("p2foul" + points).disabled = frameOver || isP1;
    });
    document.getElementById("btn-switch").disabled = frameOver;
    var playAgainButton = document.getElementById("btn-play-again");
    playAgainButton.disabled = !playAgainAvailable || frameOver;
    playAgainButton.style.display = playAgainAvailable && !frameOver ? "" : "none";
    var nextFrameButtons = document.getElementsByClassName("BUTTON_RESET");
    for (var i = 0; i < nextFrameButtons.length; i++) nextFrameButtons[i].disabled = !frameOver;

    if (frameOver) return;

    var activePrefix = isP1 ? "p1" : "p2";
    var colorButtons = ["black","pink","blue","brown","green","yellow"];

    if (gamePhase === PHASE_REDS) {
        document.getElementById(activePrefix + "red").disabled = false;
        colorButtons.forEach(function(color) {
            document.getElementById(activePrefix + color).disabled = true;
        });
    } else if (gamePhase === PHASE_COLOR_AFTER_RED) {
        document.getElementById(activePrefix + "red").disabled = true;
        colorButtons.forEach(function(color) {
            document.getElementById(activePrefix + color).disabled = false;
        });
    } else if (gamePhase === PHASE_COLORS) {
        var colorSequence = {27: "yellow", 25: "green", 22: "brown", 18: "blue", 13: "pink", 7: "black"};
        var nextColor = colorSequence[colorsRemaining];
        ["red","black","pink","blue","brown","green","yellow"].forEach(function(color) {
            document.getElementById(activePrefix + color).disabled = (color !== nextColor);
        });
    } else if (gamePhase === PHASE_RESPOTTED_BLACK) {
        ["red","black","pink","blue","brown","green","yellow"].forEach(function(color) {
            document.getElementById(activePrefix + color).disabled = color !== "black";
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

    var snookerTarget = GetSnookerTarget(myScore, oppScore, remaining);
    var markerEl = document.getElementById("bar-win-marker");

    if (snookerTarget.reachable) {
        var markerPct = clampPct(snookerTarget.score / scale * 100);
        markerEl.style.display = "";
        markerEl.style.left = markerPct + "%";
        document.getElementById("bar-marker-label").innerText = snookerTarget.score;
    } else {
        markerEl.style.display = "none";
        document.getElementById("bar-marker-label").innerText = "";
    }
}

function clampPct(pct) {
    return Math.min(Math.max(pct, 0), 100);
}

function GetSnookerTarget(myScore, oppScore, remaining) {
    var maxScore = myScore + remaining;

    if (myScore > oppScore + remaining) {
        return {
            score: myScore,
            pointsNeeded: 0,
            reachable: true
        };
    }

    var targetScore = Math.floor((myScore + oppScore + remaining) / 2) + 1;

    return {
        score: targetScore,
        pointsNeeded: Math.max(0, targetScore - myScore),
        reachable: targetScore <= maxScore
    };
}

function AheadCount(p1point, p2point) {
    return Math.abs(p1point - p2point);
}

function Remaining() {
    if (gamePhase === PHASE_FRAME_OVER) return 0;
    if (gamePhase === PHASE_RESPOTTED_BLACK) return BLACK;

    var pendingColorMax = gamePhase === PHASE_COLOR_AFTER_RED ? BLACK : 0;
    if (gamePhase === PHASE_REDS || gamePhase === PHASE_COLOR_AFTER_RED) {
        return (redcount * (RED + BLACK)) + colorsRemaining + pendingColorMax;
    }
    return colorsRemaining;
}


ApplyLanguage();
RefreshUI();
