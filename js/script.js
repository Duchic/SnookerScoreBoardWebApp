var p1point = 0;
var p1break = 0;
var p2point = 0;
var p2break = 0;


var maxpoints = 147;
var remaining = 147;
var ahead = 0;
var towin = 74;

var redcount = 15;
const COLOR_FINISH = 27;

var p1redused = 0;
var p1blackused = 0;
var p1pinkused = 0;
var p1blueused = 0;
var p1brownused = 0;
var p1greenused = 0;
var p1yellowused = 0;

var p2redused = 0;
var p2blackused = 0;
var p2pinkused = 0;
var p2blueused = 0;
var p2brownused = 0;
var p2greenused = 0;
var p2yellowused = 0;

const RED = 1;
const BLACK = 7;
const PINK = 6;
const BLUE = 5;
const BROWN = 4;
const GREEN = 3;
const YELLOW = 2;


function Red(player) {
    console.log(player);
    if (player === "p1"){
        //console.log("p1");
        p2break = 0;
        p1break = p1break + RED;
        p1point = p1point + RED;
        p1redused++;
        redcount--;
    } else {
        console.log("jsem v p2");
        p1break = 0;
        p2point = p2point + RED;
        p2break = p2break + RED;
        p2redused++;
        redcount--;

    }
    RefreshUI();
}

function Black(player) {
    if (player === "p1"){
        p1break = p1break + BLACK;
        p1point = p1point + BLACK;
        p1blackused++;
    } else {
        p2break = p2break + BLACK;
        p2point = p2point + BLACK;
        p2blackused++;
    }
    RefreshUI();
}

function Pink(player) {
    if (player === "p1"){
        p1break = p1break + PINK;
        p1point = p1point + PINK;
        p1pinkused++;
    } else {
        p2break = p2break + PINK;
        p2point = p2point + PINK;
        p2pinkused++;
    }
    RefreshUI();
}

function Blue(player) {
    if (player === "p1"){
        p1break = p1break + BLUE;
        p1point = p1point + BLUE;
        p1blueused++;
    } else {
        p2break = p2break + BLUE;
        p2point = p2point + BLUE;
        p2blueused++;
    }
    RefreshUI();
}

function RefreshUI() {
    document.getElementById("p1points").innerHTML = p1point;
    document.getElementById("p1break").innerHTML = p1break; 
    document.getElementById("p2points").innerHTML = p2point; 
    document.getElementById("p2break").innerHTML = p2break; 
}


function AheadCount(p1point, p2point) {
    if(p1point - p2point > 0){
        return p1point - p2point;
    }else {
        return p2point - p1point;
    }
}