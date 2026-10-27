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
var frameStarted = false;
var playAgainAvailable = false;
var freeBallAvailable = false;
var foulOffender = null;
var foulPosition = null;
var ballCountAction = null;

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

function TPoints(key, points) {
    return T(key).replace("{points}", points);
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
    SetText("frame-starter-label", T("frameStarter"));
    document.getElementById("lang-cs").className = "BUTTON_LANG" + (currentLanguage === "cs" ? " active-language" : "");
    document.getElementById("lang-en").className = "BUTTON_LANG" + (currentLanguage === "en" ? " active-language" : "");

    SetPlayerDefaultName("p1-name", "player1");
    SetPlayerDefaultName("p2-name", "player2");
    SetText("p1-name-label", T("player1Name"));
    SetText("p2-name-label", T("player2Name"));

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
    SetValueByClass("BUTTON_MORE_REDS", T("moreReds"));
    SetText("btn-replay-miss", T("replayMiss"));
    SetText("btn-foul-reds", T("foulReds"));
    SetText("ball-count-label", T("redCount"));
    SetText("ball-count-cancel", T("cancel"));
    SetText("ball-count-confirm", T("confirm"));
    ["p1", "p2"].forEach(function(player) {
        document.getElementById(player + "more-reds").setAttribute("aria-label", T("multipleReds"));
    });
    SetValue("btn-free-ball", T("freeBall"));
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

function GetGameState() {
    return {
        p1point:         p1point,
        p1break:         p1break,
        p2point:         p2point,
        p2break:         p2break,
        redcount:        redcount,
        colorsRemaining: colorsRemaining,
        gamePhase:       gamePhase,
        currentPlayer:   currentPlayer,
        frameStarter:    frameStarter,
        frameStarted:    frameStarted,
        playAgainAvailable: playAgainAvailable,
        freeBallAvailable: freeBallAvailable,
        foulOffender:    foulOffender,
        foulPosition:   foulPosition
    };
}

function saveState() {
    undoStack.push(GetGameState());
}

function RestoreGameState(state) {
    p1point         = state.p1point;
    p1break         = state.p1break;
    p2point         = state.p2point;
    p2break         = state.p2break;
    redcount        = state.redcount;
    colorsRemaining = state.colorsRemaining;
    gamePhase        = state.gamePhase;
    currentPlayer   = state.currentPlayer;
    frameStarter    = state.frameStarter;
    frameStarted    = state.frameStarted;
    playAgainAvailable = state.playAgainAvailable;
    freeBallAvailable = state.freeBallAvailable;
    foulOffender    = state.foulOffender;
    foulPosition    = state.foulPosition;
}

function Undo() {
    if (undoStack.length === 0) return;
    RestoreGameState(undoStack.pop());
    RefreshUI();
}

function ClearFoulOptions() {
    playAgainAvailable = false;
    freeBallAvailable = false;
    foulOffender = null;
    foulPosition = null;
}

function Red(player, count) {
    if (count === undefined) count = 1;
    if (player !== currentPlayer || gamePhase !== PHASE_REDS || redcount <= 0) return;
    if (!Number.isInteger(count) || count < 1 || count > redcount) return;
    saveState();
    frameStarted = true;
    ClearFoulOptions();
    if (player === "p1"){
        p2break = 0;
        p1break += count * RED;
        p1point += count * RED;
    } else {
        p1break = 0;
        p2point += count * RED;
        p2break += count * RED;
    }
    redcount -= count;
    gamePhase = PHASE_COLOR_AFTER_RED;
    RefreshUI();
}

function CanAdjustFoulReds() {
    return playAgainAvailable && foulPosition && foulPosition.redcount > 0 &&
        currentPlayer !== foulOffender && gamePhase !== PHASE_FRAME_OVER;
}

function OpenBallCount(mode, player) {
    if (mode === "reds") {
        if (player !== currentPlayer || gamePhase !== PHASE_REDS || redcount < 2) return;
    } else if (mode !== "foul" || !CanAdjustFoulReds()) {
        return;
    }
    ballCountAction = { mode: mode, player: player };
    var input = document.getElementById("ball-count");
    input.min = mode === "reds" ? 1 : 0;
    input.max = mode === "reds" ? redcount : foulPosition.redcount;
    input.value = mode === "reds" ? 2 : foulPosition.redcount - redcount;
    input.setCustomValidity("");
    SetText("ball-count-title", T(mode === "reds" ? "multipleReds" : "foulReds"));
    SetText("ball-count-help", T(mode === "reds" ? "multipleRedsHelp" : "foulRedsHelp"));
    document.getElementById("ball-count-dialog").showModal();
    input.focus();
    input.select();
}

function SubmitBallCount(event) {
    event.preventDefault();
    var input = document.getElementById("ball-count");
    if (!ballCountAction || !input.reportValidity()) return;
    var count = Number(input.value);
    if (!Number.isInteger(count)) return;
    var action = ballCountAction;
    document.getElementById("ball-count-dialog").close();
    ballCountAction = null;
    if (action.mode === "reds") Red(action.player, count);
    else SetFoulReds(count);
}

function SetFoulReds(count) {
    if (!CanAdjustFoulReds() || !Number.isInteger(count) || count < 0 ||
        count > foulPosition.redcount || count === foulPosition.redcount - redcount) return;
    saveState();
    redcount = foulPosition.redcount - count;
    gamePhase = redcount > 0 ? PHASE_REDS : PHASE_COLORS;
    freeBallAvailable = GetFreeBallValue() > 0;
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
    frameStarted = true;
    ClearFoulOptions();
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

function GetFreeBallValue() {
    if (gamePhase === PHASE_REDS && redcount > 0) return RED;
    if (gamePhase === PHASE_COLORS && colorsRemaining > BLACK) return GetNextColorValue();
    return 0;
}

function FreeBall() {
    var value = GetFreeBallValue();
    if (!freeBallAvailable || !foulOffender || currentPlayer === foulOffender || value <= 0) return;

    var wasRedOn = gamePhase === PHASE_REDS;
    saveState();
    ClearFoulOptions();

    if (currentPlayer === "p1") {
        p2break = 0;
        p1break += value;
        p1point += value;
    } else {
        p1break = 0;
        p2break += value;
        p2point += value;
    }

    if (wasRedOn) gamePhase = PHASE_COLOR_AFTER_RED;
    RefreshUI();
}

function CanApplyFoul(player, points) {
    if (player !== currentPlayer || gamePhase === PHASE_FRAME_OVER) return false;
    if ([BROWN, BLUE, PINK, BLACK].indexOf(points) === -1) return false;

    var minimum = BROWN;
    if (gamePhase === PHASE_COLORS) minimum = Math.max(BROWN, GetNextColorValue());
    if (gamePhase === PHASE_RESPOTTED_BLACK) minimum = BLACK;
    return points >= minimum;
}

function applyFoul(player, points) {
    if (!CanApplyFoul(player, points)) return;
    saveState();
    frameStarted = true;
    ClearFoulOptions();
    // Keep only the table position: replaying a miss must retain penalty points.
    var originalPosition = {
        redcount: redcount,
        colorsRemaining: colorsRemaining,
        gamePhase: gamePhase
    };
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
        freeBallAvailable = GetFreeBallValue() > 0;
        foulOffender = player;
        foulPosition = originalPosition;
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
    ClearFoulOptions();
    RefreshUI();
}

function ReplayMiss() {
    if (!playAgainAvailable || !foulOffender || !foulPosition ||
        gamePhase === PHASE_FRAME_OVER || gamePhase === PHASE_RESPOTTED_BLACK) return;
    saveState();
    currentPlayer = foulOffender;
    redcount = foulPosition.redcount;
    colorsRemaining = foulPosition.colorsRemaining;
    gamePhase = foulPosition.gamePhase;
    p1break = 0;
    p2break = 0;
    ClearFoulOptions();
    RefreshUI();
}

function CanSelectFrameStarter() {
    return !frameStarted && p1frames === 0 && p2frames === 0;
}

function SetFrameStarter(player) {
    if (!CanSelectFrameStarter() || (player !== "p1" && player !== "p2") ||
        player === frameStarter) return;
    saveState();
    frameStarter = player;
    currentPlayer = player;
    RefreshUI();
}

function GetPlayerName(player) {
    return document.getElementById(player + "-name").value.trim() ||
        T(player === "p1" ? "player1" : "player2");
}

function UpdateFrameStarterUI() {
    var selector = document.getElementById("frame-starter");
    ["p1", "p2"].forEach(function(player, index) {
        selector.options[index].textContent = GetPlayerName(player);
    });
    selector.value = frameStarter;
    selector.disabled = !CanSelectFrameStarter();
    selector.title = T(selector.disabled ? "frameStarterLocked" : "selectFirstStarter");
}

function PlayerNameChanged() {
    RefreshUI();
}

function TogglePlayer() {
    if (gamePhase === PHASE_FRAME_OVER) return;
    saveState();
    frameStarted = true;
    ClearFoulOptions();
    if (currentPlayer === "p1") {
        p1break = 0;
        currentPlayer = "p2";
    } else {
        p2break = 0;
        currentPlayer = "p1";
    }
    if (gamePhase === PHASE_COLOR_AFTER_RED) {
        gamePhase = redcount > 0 ? PHASE_REDS : PHASE_COLORS;
    }
    RefreshUI();
}

function WinFrame(player) {
    if (gamePhase === PHASE_FRAME_OVER || (player !== "p1" && player !== "p2")) return;
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
    frameStarted = false;
    undoStack = [];
    p1point = 0;
    p1break = 0;
    p2point = 0;
    p2break = 0;
    redcount = 15;
    colorsRemaining = COLOR_FINISH;
    gamePhase = PHASE_REDS;
    currentPlayer = frameStarter;
    ClearFoulOptions();
    RefreshUI();
}

function ResetMatch() {
    if (!confirm(T("confirmNewMatch"))) return;
    matchStorageBlocked = false;
    p1frames = 0;
    p2frames = 0;
    frameStarter = "p1";
    Reset(false);
}

function UpdateFrameResultUI() {
    var frameOver = gamePhase === PHASE_FRAME_OVER;
    document.getElementById("frame-result").hidden = !frameOver;
    document.getElementById("live-stats").hidden = frameOver;
    document.getElementById("live-progress").hidden = frameOver;
    if (!frameOver) return;

    var winner = p1point > p2point ? "p1" : p2point > p1point ? "p2" : null;
    var name = winner ? GetPlayerName(winner) : "";
    SetText("frame-result-title", T("frameFinished"));
    SetText("frame-result-winner", winner ? T("frameWinner").replace("{player}", function() { return name; }) : T("tied"));
    SetText("frame-result-score", T("finalScore").replace("{score}", p1point + " : " + p2point));
    SetText("frame-result-help", T("frameFinishedHelp"));
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
    var aheadLbl = gap === 0 ? T("tied") : T("playerAhead").replace("{player}", function() {
        return GetPlayerName(gap > 0 ? "p1" : "p2");
    });
    document.getElementById("ahead_lbl").innerText  = aheadLbl;
    document.getElementById("ahead").innerText      = Math.abs(gap);

    document.getElementById("remaining").innerText  = remaining;
    document.getElementById("maxPoints").innerText  = myScore + remaining;

    var frameStatus = GetFrameStatus(myScore, oppScore, remaining);
    var snookerTarget = GetSnookerTarget(myScore, oppScore, remaining);
    var toWinEl   = document.getElementById("toWin");
    var maxEl     = document.getElementById("maxPoints");
    toWinEl.title = "";

    if (gamePhase === PHASE_RESPOTTED_BLACK) {
        toWinEl.innerText = T("blackDecides");
        toWinEl.style.color = "#a65d00";
        toWinEl.title = T("blackDecidesTitle");
    } else if (frameStatus.type === "safe") {
        toWinEl.innerText = T("check");
        toWinEl.style.color = "#16731a";
        toWinEl.title = TPoints("opponentNeedsPenaltyTitle", frameStatus.penaltyPoints);
    } else if (frameStatus.type === "tiePossible") {
        toWinEl.innerText = T("tiePossible");
        toWinEl.style.color = "#a65d00";
        toWinEl.title = T("tiePossibleTitle");
    } else if (frameStatus.type === "needsPenalty") {
        toWinEl.innerText = TPoints("penaltyPointsShort", frameStatus.penaltyPoints);
        toWinEl.style.color = "#b00020";
        toWinEl.title = TPoints("penaltyPointsTitle", frameStatus.penaltyPoints);
    } else {
        toWinEl.innerText = snookerTarget.pointsNeeded;
        toWinEl.style.color = "";
    }

    maxEl.style.color = frameStatus.type === "needsPenalty" ? "#b00020" :
        frameStatus.type === "tiePossible" || gamePhase === PHASE_RESPOTTED_BLACK ? "#a65d00" : "";

    var f1 = document.getElementById("p1-frames"); if (f1) f1.innerText = p1frames;
    var f2 = document.getElementById("p2-frames"); if (f2) f2.innerText = p2frames;
    document.getElementById("btn-undo").disabled = undoStack.length === 0;
    UpdateFrameStarterUI();
    UpdateFrameResultUI();
    UpdateActivePlayer();
    UpdateProgressBars(remaining);
    PersistMatch();
}

function UpdateActivePlayer() {
    var isP1 = currentPlayer === "p1";
    var frameOver = gamePhase === PHASE_FRAME_OVER;

    document.getElementById("p1-name").className = "player-name-input " + (!frameOver && isP1 ? "active-player-name" : "inactive-player-name");
    document.getElementById("p2-name").className = "player-name-input " + (!frameOver && !isP1 ? "active-player-name" : "inactive-player-name");
    var winButtons = document.getElementsByClassName("BUTTON_WIN_FRAME");
    for (var w = 0; w < winButtons.length; w++) {
        winButtons[w].disabled = frameOver;
        winButtons[w].hidden = frameOver;
    }

    var p1Balls = ["p1red","p1black","p1pink","p1blue","p1brown","p1green","p1yellow"];
    var p2Balls = ["p2red","p2black","p2pink","p2blue","p2brown","p2green","p2yellow"];
    p1Balls.forEach(function(id) { document.getElementById(id).disabled = frameOver || !isP1; });
    p2Balls.forEach(function(id) { document.getElementById(id).disabled = frameOver ||  isP1; });

    [4, 5, 6, 7].forEach(function(points) {
        document.getElementById("p1foul" + points).disabled = !CanApplyFoul("p1", points);
        document.getElementById("p2foul" + points).disabled = !CanApplyFoul("p2", points);
    });
    ["p1", "p2"].forEach(function(player) {
        document.getElementById(player + "more-reds").disabled =
            player !== currentPlayer || gamePhase !== PHASE_REDS || redcount < 2;
    });
    document.getElementById("btn-switch").disabled = frameOver;
    var playAgainButton = document.getElementById("btn-play-again");
    playAgainButton.disabled = !playAgainAvailable || frameOver;
    playAgainButton.style.display = playAgainAvailable && !frameOver ? "" : "none";
    var replayMissButton = document.getElementById("btn-replay-miss");
    replayMissButton.disabled = !playAgainAvailable || !foulPosition || frameOver;
    replayMissButton.style.display = replayMissButton.disabled ? "none" : "";
    var foulRedsButton = document.getElementById("btn-foul-reds");
    foulRedsButton.disabled = !CanAdjustFoulReds();
    foulRedsButton.style.display = foulRedsButton.disabled ? "none" : "";
    foulRedsButton.innerText = T("foulReds") + (foulPosition ? ": " + (foulPosition.redcount - redcount) : "");
    var freeBallButton = document.getElementById("btn-free-ball");
    var freeBallValue = GetFreeBallValue();
    freeBallButton.value = freeBallValue > 0 ? TPoints("freeBallWithPoints", freeBallValue) : T("freeBall");
    freeBallButton.disabled = !freeBallAvailable || frameOver;
    freeBallButton.style.display = freeBallAvailable && !frameOver ? "" : "none";
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
    var isP1 = currentPlayer === "p1";

    var myScore  = isP1 ? p1point : p2point;
    var oppScore = isP1 ? p2point : p1point;
    var maxVal = myScore + remaining;
    var scale = Math.max(147, maxVal, oppScore);
    var currentColor   = isP1 ? "#1155cc" : "#cc2200";
    var potentialColor = isP1 ? "#99bbf0" : "#f0a090";

    document.getElementById("bar-player-label").innerText             = GetPlayerName(currentPlayer);
    document.getElementById("bar-current").style.background           = currentColor;
    document.getElementById("bar-potential").style.background         = potentialColor;
    document.getElementById("legend-current-dot").style.background    = currentColor;
    document.getElementById("legend-potential-dot").style.background  = potentialColor;

    var currentPct   = Math.min(myScore / scale * 100, 100);
    var potentialPct = Math.min(remaining / scale * 100, 100 - currentPct);
    document.getElementById("bar-current").style.width   = currentPct + "%";
    document.getElementById("bar-potential").style.width = potentialPct + "%";

    var scoreLabelEl = document.getElementById("bar-score-label");
    scoreLabelEl.dataset.position = currentPct;
    scoreLabelEl.style.color = currentColor;
    // A shared endpoint needs only one label.
    scoreLabelEl.innerText   = myScore > 0 && myScore !== maxVal ? myScore : "";

    var maxPct     = clampPct(maxVal / scale * 100);
    var maxLabelEl = document.getElementById("bar-max-label");
    maxLabelEl.dataset.position = maxPct;
    maxLabelEl.style.color = currentColor;
    maxLabelEl.innerText   = maxVal;

    var frameStatus = GetFrameStatus(myScore, oppScore, remaining);
    var snookerTarget = GetSnookerTarget(myScore, oppScore, remaining);
    var markerEl = document.getElementById("bar-win-marker");

    if (frameStatus.type === "needsPenalty") {
        maxLabelEl.style.color = "#b00020";
    } else if (frameStatus.type === "tiePossible" || gamePhase === PHASE_RESPOTTED_BLACK) {
        maxLabelEl.style.color = "#a65d00";
    }

    if (snookerTarget.reachable && gamePhase !== PHASE_RESPOTTED_BLACK) {
        var markerPct = clampPct(snookerTarget.score / scale * 100);
        markerEl.style.display = "";
        markerEl.style.left = markerPct + "%";
        document.getElementById("bar-marker-label").dataset.position = markerPct;
        document.getElementById("bar-marker-label").innerText = snookerTarget.score;
    } else {
        markerEl.style.display = "none";
        document.getElementById("bar-marker-label").innerText = "";
    }
    LayoutProgressLabels();
}

function LayoutProgressLabels() {
    var container = document.querySelector(".progress-bar-container");
    var width = container.clientWidth;
    if (!width) return;

    // Keep the whole number inside the bar, including at either endpoint.
    function place(id) {
        var label = document.getElementById(id);
        var halfWidth = label.getBoundingClientRect().width / 2;
        var center = Math.max(halfWidth, Math.min(width - halfWidth,
            width * Number(label.dataset.position || 0) / 100));
        label.style.left = center + "px";
        return { element: label, center: center, halfWidth: halfWidth };
    }

    var score = place("bar-score-label");
    var maximum = place("bar-max-label");
    place("bar-marker-label");
    var gap = 8;
    if (score.element.textContent && score.center + score.halfWidth + gap > maximum.center - maximum.halfWidth) {
        score.center = Math.max(score.halfWidth, maximum.center - maximum.halfWidth - gap - score.halfWidth);
        maximum.center = Math.min(width - maximum.halfWidth,
            Math.max(maximum.center, score.center + score.halfWidth + gap + maximum.halfWidth));
        score.element.style.left = score.center + "px";
        maximum.element.style.left = maximum.center + "px";
    }
}

function clampPct(pct) {
    return Math.min(Math.max(pct, 0), 100);
}

function GetFrameStatus(myScore, oppScore, remaining) {
    var maxScore = myScore + remaining;
    var opponentMaxScore = oppScore + remaining;

    if (myScore > opponentMaxScore) {
        return {
            type: "safe",
            penaltyPoints: myScore - opponentMaxScore
        };
    }

    if (maxScore < oppScore) {
        return {
            type: "needsPenalty",
            penaltyPoints: oppScore - maxScore
        };
    }

    if (maxScore === oppScore) {
        return {
            type: "tiePossible",
            penaltyPoints: 0
        };
    }

    return {
        type: "inPlay",
        penaltyPoints: 0
    };
}

function GetSnookerTarget(myScore, oppScore, remaining) {
    var maxScore = myScore + remaining;
    var frameStatus = GetFrameStatus(myScore, oppScore, remaining);

    if (frameStatus.type === "safe") {
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
        reachable: frameStatus.type === "inPlay" && targetScore <= maxScore
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


RestoreMatch();
ApplyLanguage();
RefreshUI();

// Re-measure after resizing or loading the web font, without changing game state.
var progressResizeObserver = new ResizeObserver(LayoutProgressLabels);
progressResizeObserver.observe(document.querySelector(".progress-bar-container"));
document.fonts.ready.then(LayoutProgressLabels);
