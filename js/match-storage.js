const MATCH_STORAGE_KEY = "snookerScoreboardMatch";
const MATCH_STORAGE_VERSION = 1;
var matchStorageBlocked = false;
var matchStorageNotice = "";

function GetMatchSnapshot() {
    return {
        version: MATCH_STORAGE_VERSION,
        state: GetGameState(),
        frames: { p1: p1frames, p2: p2frames },
        players: {
            p1: document.getElementById("p1-name").value,
            p2: document.getElementById("p2-name").value
        },
        undoStack: undoStack
    };
}

function UpdateStorageNotice() {
    var notice = document.getElementById("match-storage-notice");
    notice.hidden = !matchStorageNotice;
    notice.textContent = matchStorageNotice ? T(matchStorageNotice) : "";
}

function PersistMatch() {
    if (!matchStorageBlocked) {
        try {
            // One write keeps the score, table position and history together.
            localStorage.setItem(MATCH_STORAGE_KEY, JSON.stringify(GetMatchSnapshot()));
            matchStorageNotice = "";
        } catch (e) {
            matchStorageNotice = "matchSaveFailed";
        }
    }
    UpdateStorageNotice();
}

function IsStoredObject(value) {
    return value !== null && typeof value === "object" && !Array.isArray(value);
}

function IsStoredCount(value) {
    return Number.isSafeInteger(value) && value >= 0;
}

function IsStoredPlayer(value) {
    return value === "p1" || value === "p2";
}

function IsStoredPosition(position) {
    if (!IsStoredObject(position) || !IsStoredCount(position.redcount) || position.redcount > 15) return false;
    switch (position.gamePhase) {
        case PHASE_REDS:
            return position.redcount > 0 && position.colorsRemaining === COLOR_FINISH;
        case PHASE_COLOR_AFTER_RED:
            return position.colorsRemaining === COLOR_FINISH;
        case PHASE_COLORS:
            return position.redcount === 0 && [27, 25, 22, 18, 13, 7].indexOf(position.colorsRemaining) !== -1;
        case PHASE_RESPOTTED_BLACK:
            return position.redcount === 0 && position.colorsRemaining === BLACK;
        case PHASE_FRAME_OVER:
            return position.redcount === 0 && position.colorsRemaining === 0;
        default:
            return false;
    }
}

function IsStoredGameState(state) {
    if (!IsStoredPosition(state) ||
        ![state.p1point, state.p2point, state.p1break, state.p2break].every(IsStoredCount) ||
        state.p1break > state.p1point || state.p2break > state.p2point ||
        !IsStoredPlayer(state.currentPlayer) || !IsStoredPlayer(state.frameStarter) ||
        typeof state.frameStarted !== "boolean" ||
        typeof state.playAgainAvailable !== "boolean" || typeof state.freeBallAvailable !== "boolean") return false;

    if (!state.frameStarted && (state.gamePhase !== PHASE_REDS || state.redcount !== 15 ||
        state.p1point !== 0 || state.p2point !== 0 || state.currentPlayer !== state.frameStarter ||
        state.playAgainAvailable)) return false;

    if (state.playAgainAvailable) {
        if (!IsStoredPlayer(state.foulOffender) || state.currentPlayer === state.foulOffender ||
            !IsStoredPosition(state.foulPosition) ||
            [PHASE_REDS, PHASE_COLOR_AFTER_RED, PHASE_COLORS].indexOf(state.foulPosition.gamePhase) === -1 ||
            [PHASE_REDS, PHASE_COLORS].indexOf(state.gamePhase) === -1 ||
            state.foulPosition.redcount < state.redcount ||
            state.foulPosition.colorsRemaining !== state.colorsRemaining) return false;
        var canHaveFreeBall = state.gamePhase === PHASE_REDS || state.colorsRemaining > BLACK;
        if (state.freeBallAvailable && !canHaveFreeBall) return false;
    } else if (state.freeBallAvailable || state.foulOffender !== null || state.foulPosition !== null) {
        return false;
    }
    return true;
}

function IsStoredMatch(match) {
    return IsStoredObject(match) && match.version === MATCH_STORAGE_VERSION &&
        IsStoredGameState(match.state) &&
        IsStoredObject(match.frames) && IsStoredCount(match.frames.p1) && IsStoredCount(match.frames.p2) &&
        IsStoredObject(match.players) && typeof match.players.p1 === "string" && typeof match.players.p2 === "string" &&
        Array.isArray(match.undoStack) && match.undoStack.every(IsStoredGameState);
}

function RestoreMatch() {
    var saved;
    try {
        saved = localStorage.getItem(MATCH_STORAGE_KEY);
    } catch (e) {
        matchStorageBlocked = true;
        matchStorageNotice = "matchLoadFailed";
        return;
    }
    if (saved === null) return;

    var match;
    try {
        match = JSON.parse(saved);
        if (!IsStoredMatch(match)) throw new Error("Invalid saved match");
    } catch (e) {
        // Do not replace unreadable data with an empty match on page load.
        matchStorageBlocked = true;
        matchStorageNotice = "matchDataInvalid";
        return;
    }

    RestoreGameState(match.state);
    p1frames = match.frames.p1;
    p2frames = match.frames.p2;
    document.getElementById("p1-name").value = match.players.p1;
    document.getElementById("p2-name").value = match.players.p2;
    undoStack = match.undoStack;
}
