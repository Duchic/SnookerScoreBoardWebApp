var p1point = 0;
var p1break = 0;
var p2point = 0;
var p2break = 0;

var redcount = 15;
const COLOR_FINISH = 27;

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

function Miss(player) {
    if (player === "p1"){
        p1break = 0;
    } else {
        p2break = 0;
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

function Reset() {
    p1point = 0;
    p1break = 0;
    p2point = 0;
    p2break = 0;
    redcount = 15;
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
